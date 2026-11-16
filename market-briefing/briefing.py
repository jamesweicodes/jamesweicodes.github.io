"""Build a daily U.S. market briefing from public, unauthenticated sources.

Prices come from the Yahoo Finance chart endpoint. Headlines come from CNBC
RSS, with a Federal Reserve press item added only when a recent release is
about policy. Nothing here is a recommendation to buy or sell.
"""

from __future__ import annotations

import json
import logging
import re
import ssl
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

log = logging.getLogger("market_briefing")

ROOT = Path(__file__).resolve().parent
SAMPLE_PATH = ROOT / "sample_briefing.json"
USER_AGENT = "Mozilla/5.0 (compatible; MarketBriefing/1.0; educational research)"
TIMEOUT_SECONDS = 12
LIVE_CACHE_SECONDS = 600
SAMPLE_CACHE_SECONDS = 60
NY = ZoneInfo("America/New_York")

DISCLAIMER = (
    "Not financial advice. This page is research context: what moved, why it "
    "can matter for stocks, rates, and risk, and which themes a long-term "
    "investor might understand. It is not a recommendation to buy, sell, or "
    "hold any security, not a forecast, and not tailored to anyone's finances."
)

_TAG = re.compile(r"<[^>]+>")
_SPACE = re.compile(r"\s+")
_lock = threading.Lock()
_cache: dict = {"expires": 0.0, "data": None}


class BriefingError(Exception):
    """The live briefing could not be assembled completely."""


@dataclass(frozen=True)
class Instrument:
    id: str
    symbol: str
    label: str
    group: str  # equity, rate, risk, commodity, fx
    unit: str  # index, yield, level, usd
    primary: bool


INSTRUMENTS: tuple[Instrument, ...] = (
    Instrument("spx", "^GSPC", "S&P 500", "equity", "index", True),
    Instrument("dji", "^DJI", "Dow", "equity", "index", True),
    Instrument("ixic", "^IXIC", "Nasdaq", "equity", "index", True),
    Instrument("rut", "^RUT", "Russell 2000", "equity", "index", False),
    Instrument("tnx", "^TNX", "U.S. 10-year yield", "rate", "yield", True),
    Instrument("fvx", "^FVX", "U.S. 5-year yield", "rate", "yield", False),
    Instrument("tyx", "^TYX", "U.S. 30-year yield", "rate", "yield", False),
    Instrument("irx", "^IRX", "13-week T-bill yield", "rate", "yield", False),
    Instrument("vix", "^VIX", "VIX", "risk", "level", True),
    Instrument("oil", "CL=F", "WTI crude", "commodity", "usd", False),
    Instrument("gold", "GC=F", "Gold", "commodity", "usd", False),
    Instrument("dxy", "DX-Y.NYB", "U.S. dollar index", "fx", "index", False),
)

FEEDS: tuple[tuple[str, str, str], ...] = (
    (
        "CNBC",
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
        "top",
    ),
    (
        "CNBC Economy",
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
        "economy",
    ),
    (
        "Federal Reserve",
        "https://www.federalreserve.gov/feeds/press_all.xml",
        "fed",
    ),
)

# Fed RSS includes payment-operations notes. Keep a release only when the
# title is actually about policy or financial conditions.
# Columns and lifestyle items show up in the same public feeds as market news.
_SKIP_TITLE = (
    "flight delay",
    "van gogh",
    "i've owned",
    "i’ve owned",
    "my 401",
    "should i ",
    "my wife",
    "my husband",
    "my brother",
    "my sister",
    "my mother",
    "my father",
)

_FED_POLICY = (
    "fomc",
    "federal funds",
    "interest rate",
    "monetary policy",
    "inflation",
    "financial stability",
    "balance sheet",
    "quantitative",
    "beige book",
    "supervision and regulation",
)

_THEME_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("artificial intelligence", ("nvidia", "artificial intelligence", "anthropic", "semiconductor", " ai ", "a.i.")),
    ("monetary policy", ("federal reserve", "fomc", "rate cut", "rate hike", "interest rate", "powell")),
    ("inflation", ("inflation", "cpi", "ppi", "wholesale price", "consumer price")),
    ("the labor market", ("jobless", "payroll", "unemployment", "jobs report", "nonfarm")),
    ("energy prices", ("oil", "crude", "opec", "natural gas", "energy cost")),
    ("geopolitics and trade", ("war", "summit", "tariff", "sanction", "china", "ukraine", "middle east")),
    ("earnings and new listings", ("earnings", "ipo", "profit")),
)


@dataclass
class Quote:
    instrument: Instrument
    price: float
    session_base: float | None
    week_base: float | None
    session_date: str | None
    sessions: int
    bars: tuple[tuple[str, float], ...] = ()


@dataclass
class Headline:
    title: str
    link: str
    source: str
    published: datetime
    summary: str
    kind: str


def _request(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    context = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS, context=context) as response:
        return response.read()


def _pct(new: float | None, old: float | None) -> float | None:
    if new is None or old is None or old == 0:
        return None
    return (new - old) / old * 100.0


def _bps(new: float | None, old: float | None) -> float | None:
    """Yield quotes are already in percent, so 0.01 is one basis point."""
    if new is None or old is None:
        return None
    return (new - old) * 100.0


def _parse_chart(payload: dict, instrument: Instrument) -> Quote:
    chart = payload.get("chart") or {}
    results = chart.get("result") or []
    if chart.get("error") or not results:
        raise BriefingError(f"no chart for {instrument.symbol}")
    result = results[0]
    meta = result.get("meta") or {}
    timestamps = result.get("timestamp") or []
    quotes = ((result.get("indicators") or {}).get("quote") or [{}])[0]
    closes = quotes.get("close") or []
    bars: list[tuple[str, float]] = []
    for stamp, close in zip(timestamps, closes):
        if close is None:
            continue
        session_day = datetime.fromtimestamp(int(stamp), timezone.utc).astimezone(NY).date()
        bars.append((session_day.isoformat(), float(close)))
    # Prefer the last daily close so a premarket tick does not rewrite the cash session.
    if bars:
        price = bars[-1][1]
    else:
        price = meta.get("regularMarketPrice")
        if price is None:
            raise BriefingError(f"no price for {instrument.symbol}")
        price = float(price)
    session_base = bars[-2][1] if len(bars) >= 2 else None
    week_base = meta.get("chartPreviousClose")
    week_base = float(week_base) if week_base is not None else (bars[0][1] if bars else None)
    # chartPreviousClose is the close before the returned window, so the
    # last price versus that close is the move across those sessions.
    if week_base == price and len(bars) >= 2:
        week_base = bars[0][1]
    session_date = bars[-1][0] if bars else None
    return Quote(
        instrument=instrument,
        price=price,
        session_base=session_base,
        week_base=week_base,
        session_date=session_date,
        sessions=len(bars),
        bars=tuple(bars),
    )


def _settle(quotes: dict[str, Quote]) -> dict[str, Quote]:
    """Use the S&P 500 cash-session date for every series.

    Futures keep trading after the stock close. Without this, oil and gold
    would show a new, partial session next to Friday's equity closes.
    """
    anchor = quotes.get("spx")
    if anchor is None or not anchor.bars:
        return quotes
    session_date = anchor.bars[-1][0]
    settled: dict[str, Quote] = {}
    for key, quote in quotes.items():
        eligible = [bar for bar in quote.bars if bar[0] <= session_date]
        if len(eligible) < 2:
            settled[key] = quote
            continue
        if len(eligible) >= 6:
            week_base = eligible[-6][1]
            sessions = 5
        else:
            week_base = eligible[0][1]
            sessions = len(eligible) - 1
        settled[key] = Quote(
            instrument=quote.instrument,
            price=eligible[-1][1],
            session_base=eligible[-2][1],
            week_base=week_base,
            session_date=eligible[-1][0],
            sessions=sessions,
            bars=tuple(eligible),
        )
    return settled


def _fetch_quote(instrument: Instrument) -> Quote:
    symbol = urllib.parse.quote(instrument.symbol, safe="")
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=10d"
    payload = json.loads(_request(url).decode("utf-8"))
    return _parse_chart(payload, instrument)


def fetch_quotes() -> dict[str, Quote]:
    found: dict[str, Quote] = {}
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(_fetch_quote, item): item for item in INSTRUMENTS}
        for future in as_completed(futures):
            item = futures[future]
            try:
                found[item.id] = future.result()
            except (BriefingError, urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, ValueError) as exc:
                log.warning("quote failed for %s: %s", item.symbol, exc)
    return found


def _clean_text(value: str | None) -> str:
    text = unescape(_TAG.sub(" ", value or ""))
    return _SPACE.sub(" ", text).strip()


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value.strip())
    except (TypeError, ValueError, IndexError):
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _rss_items(raw: bytes):
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    root = ET.fromstring(raw)
    found = root.findall(".//item")
    if found:
        return found
    return [node for node in root.iter() if node.tag.endswith("item")]


def _headline_from_item(item, source: str, kind: str) -> Headline | None:
    title = _clean_text(item.findtext("title"))
    if not title:
        return None
    published = _parse_date(item.findtext("pubDate"))
    if published is None:
        return None
    link = _clean_text(item.findtext("link"))
    summary = _clean_text(item.findtext("description"))
    if summary.lower().startswith(title.lower()):
        summary = summary[len(title) :].lstrip(" -:—")
    if len(summary) > 220:
        summary = summary[:217].rsplit(" ", 1)[0] + "…"
    return Headline(title=title, link=link, source=source, published=published, summary=summary, kind=kind)


def _fetch_feed(source: str, url: str, kind: str) -> list[Headline]:
    raw = _request(url)
    headlines = []
    for item in _rss_items(raw):
        headline = _headline_from_item(item, source, kind)
        if headline is not None:
            headlines.append(headline)
    return headlines


def fetch_headlines(now: datetime | None = None) -> list[Headline]:
    now = now or datetime.now(timezone.utc)
    collected: list[Headline] = []
    with ThreadPoolExecutor(max_workers=len(FEEDS)) as pool:
        futures = {pool.submit(_fetch_feed, source, url, kind): source for source, url, kind in FEEDS}
        for future in as_completed(futures):
            source = futures[future]
            try:
                collected.extend(future.result())
            except (urllib.error.URLError, TimeoutError, ET.ParseError, ValueError) as exc:
                log.warning("feed failed for %s: %s", source, exc)

    def eligible(item: Headline, max_age_days: int) -> bool:
        age = now - item.published
        if age.total_seconds() < -3600:
            return False
        if age.days > max_age_days:
            return False
        if item.kind == "fed":
            title = item.title.lower()
            return any(token in title for token in _FED_POLICY)
        lowered = item.title.lower()
        return not any(token in lowered for token in _SKIP_TITLE)

    chosen = [item for item in collected if eligible(item, 3)]
    if len([item for item in chosen if item.kind != "fed"]) < 4:
        chosen = [item for item in collected if eligible(item, 7)]

    chosen.sort(key=lambda item: item.published, reverse=True)
    deduped: list[Headline] = []
    seen: set[str] = set()
    fed_kept = 0
    for item in chosen:
        key = re.sub(r"[^a-z0-9]+", " ", item.title.lower()).strip()
        if not key or key in seen:
            continue
        if item.kind == "fed":
            if fed_kept >= 1:
                continue
            fed_kept += 1
        seen.add(key)
        deduped.append(item)
        if len(deduped) >= 8:
            break
    return deduped


def _themes(headlines: list[Headline]) -> list[str]:
    blob = " " + " ".join(f"{item.title} {item.summary}" for item in headlines).lower() + " "
    found = []
    for name, tokens in _THEME_RULES:
        if any(token in blob for token in tokens):
            found.append(name)
    return found


def _direction(change: float | None, flat: float) -> str:
    if change is None or abs(change) < flat:
        return "flat"
    return "up" if change > 0 else "down"


def _signed_pct(value: float | None) -> str:
    if value is None:
        return "n/a"
    if abs(value) < 0.05:
        return "0.0%"
    sign = "+" if value > 0 else ""
    return f"{sign}{value:.1f}%"


def _sentence(text: str) -> str:
    text = text.strip()
    if not text:
        return ""
    body = text[0].upper() + text[1:]
    return body if body.endswith(".") else body + "."


def _signed_bps(value: float | None) -> str:
    if value is None:
        return "n/a"
    amount = round(value)
    if amount == 0:
        return "0 bp"
    sign = "+" if amount > 0 else ""
    return f"{sign}{amount:.0f} bp"


def _price_label(quote: Quote) -> str:
    price = quote.price
    unit = quote.instrument.unit
    if unit == "yield":
        return f"{price:.2f}%"
    if unit == "usd":
        return f"${price:,.2f}"
    if unit == "level":
        return f"{price:.2f}"
    if price >= 100:
        return f"{price:,.2f}"
    return f"{price:.2f}"


def _move_view(quote: Quote) -> dict:
    session = _pct(quote.price, quote.session_base)
    week = _pct(quote.price, quote.week_base)
    session_bps = _bps(quote.price, quote.session_base)
    week_bps = _bps(quote.price, quote.week_base)
    if quote.instrument.unit == "yield":
        session_change = session_bps
        week_change = week_bps
        session_label = f"{_signed_bps(session_bps)} last session"
        week_label = f"{_signed_bps(week_bps)} over {quote.sessions} sessions"
        flat = 0.5  # basis points; matches rounding to a whole basis point
    else:
        session_change = session
        week_change = week
        session_label = f"{_signed_pct(session)} last session"
        week_label = f"{_signed_pct(week)} over {quote.sessions} sessions"
        flat = 0.05
    return {
        "id": quote.instrument.id,
        "label": quote.instrument.label,
        "group": quote.instrument.group,
        "primary": quote.instrument.primary,
        "price_label": _price_label(quote),
        "session_label": session_label,
        "week_label": week_label,
        "direction": _direction(session_change, flat),
        "session_pct": session,
        "week_pct": week,
        "session_bps": session_bps,
        "week_bps": week_bps,
        "price": quote.price,
        "session_date": quote.session_date,
        "sessions": quote.sessions,
    }


def _verb(change: float | None, flat: float = 0.05) -> str:
    if change is None:
        return "was unavailable"
    if change > flat:
        return f"rose {abs(change):.1f}%"
    if change < -flat:
        return f"fell {abs(change):.1f}%"
    return "was little changed"


def _yield_verb(bps: float | None) -> str:
    if bps is None:
        return "was unavailable"
    amount = abs(round(bps))
    if amount < 1:
        return "was little changed"
    unit = "basis point" if amount == 1 else "basis points"
    if bps > 0:
        return f"rose {amount} {unit}"
    return f"fell {amount} {unit}"


def _join(parts: list[str]) -> str:
    items = [part for part in parts if part]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _stocks_impact(moves: dict[str, dict]) -> str:
    spx = moves.get("spx")
    if not spx:
        return "The S&P 500 reading was unavailable, so the stock-market summary is incomplete."
    bits = [f"The S&P 500 {_verb(spx.get('session_pct'))} in the last cash session, to {spx['price_label']}."]
    others = []
    for key, name in (("dji", "Dow"), ("ixic", "Nasdaq"), ("rut", "Russell 2000")):
        move = moves.get(key)
        if move:
            others.append(f"the {name} {_verb(move.get('session_pct'))}")
    if others:
        bits.append(_sentence(_join(others)))
    week = spx.get("week_pct")
    if week is not None:
        bits.append(
            f"Over the {spx['sessions']} sessions in this window, the S&P 500 {_verb(week, 0.1)}."
        )
    nasdaq = moves.get("ixic")
    if nasdaq and nasdaq.get("session_pct") is not None and spx.get("session_pct") is not None:
        gap = nasdaq["session_pct"] - spx["session_pct"]
        if gap >= 0.5:
            bits.append("The Nasdaq outpaced the broad market, so larger technology shares did more of the day's work.")
        elif gap <= -0.5:
            bits.append("The Nasdaq lagged the S&P 500, so the technology-heavy end of the market was weaker than the broad list.")
    russell = moves.get("rut")
    if russell and russell.get("session_pct") is not None and spx.get("session_pct") is not None:
        gap = russell["session_pct"] - spx["session_pct"]
        if gap >= 1.0:
            bits.append("Smaller companies, via the Russell 2000, rose more than the S&P 500.")
        elif gap <= -1.0:
            bits.append("Smaller companies, via the Russell 2000, were weaker than the S&P 500.")
    bits.append(
        "For a long-term investor, one session changes the price of a diversified holding today. "
        "It does not, by itself, change the earnings that holding can collect over many years."
    )
    return " ".join(bits)


def _rates_impact(moves: dict[str, dict]) -> str:
    ten = moves.get("tnx")
    if not ten:
        return "The 10-year Treasury yield was unavailable, so the rates summary is incomplete."
    week_bps = ten.get("week_bps")
    session_verb = _yield_verb(ten.get("session_bps"))
    week_verb = _yield_verb(week_bps) if week_bps is not None else None
    sentence = f"The U.S. 10-year yield finished at {ten['price_label']}. It {session_verb} on the session"
    if week_verb:
        same_direction = session_verb.split(" ", 1)[0] == week_verb.split(" ", 1)[0] and session_verb.startswith(("rose", "fell"))
        if same_direction:
            sentence += f" and {week_verb.split(' ', 1)[1]} over {ten['sessions']} sessions"
        else:
            sentence += f" and {week_verb} over {ten['sessions']} sessions"
    sentence += "."
    extras = []
    for key, name in (("fvx", "5-year"), ("tyx", "30-year"), ("irx", "13-week bill")):
        move = moves.get(key)
        if move:
            extras.append(f"the {name} at {move['price_label']}")
    if extras:
        sentence += " Alongside it: " + _join(extras) + "."
    bill = moves.get("irx")
    if bill:
        spread = (ten["price"] - bill["price"]) * 100.0
        if spread >= 5:
            sentence += (
                f" The 10-year yield sits about {round(spread)} basis points above the 13-week bill, "
                "so longer-term money costs more than very short-term money."
            )
        elif spread <= -5:
            sentence += (
                f" The 10-year yield sits about {abs(round(spread))} basis points below the 13-week bill, "
                "so short-term money costs more than 10-year money."
            )
    reference = week_bps if week_bps is not None and abs(week_bps) >= abs(ten.get("session_bps") or 0) else ten.get("session_bps")
    if reference is not None and reference >= 5:
        sentence += (
            " Higher yields raise the return available on plain government bonds and the hurdle "
            "stock valuations are measured against. Borrowing costs that follow Treasury yields "
            "face upward pressure. Companies whose profits are expected further in the future "
            "are usually more sensitive to that hurdle than businesses that earn their cash sooner."
        )
    elif reference is not None and reference <= -5:
        sentence += (
            " Lower yields reduce the return on new government bonds and ease the hurdle "
            "stock valuations are measured against. That usually takes pressure off "
            "longer-dated growth shares more than off businesses that earn their cash sooner. "
            "Borrowing costs that follow Treasury yields face downward pressure."
        )
    else:
        sentence += (
            " Yields barely moved, so financing costs and the valuation hurdle for stocks "
            "are close to the prior session."
        )
    return sentence


def _vix_band(level: float) -> str:
    if level < 15:
        return "a quiet reading, with options pricing small day-to-day swings"
    if level < 20:
        return "a moderate reading, neither unusually calm nor a stress spike"
    if level < 30:
        return "an elevated reading, with options pricing larger day-to-day swings"
    return "a stressed reading, the kind that shows up when protection is expensive"


def _risk_impact(moves: dict[str, dict], themes: list[str]) -> str:
    sentences = []
    vix = moves.get("vix")
    if vix:
        change = ""
        if vix.get("session_pct") is not None:
            change = f", and it {_verb(vix['session_pct'])} on the session"
        week_clause = ""
        week_pct = vix.get("week_pct")
        if week_pct is not None and abs(week_pct) >= 1:
            week_clause = f" Over {vix['sessions']} sessions it {_verb(week_pct, 0.5)}."
        sentences.append(
            f"The VIX, a gauge of expected S&P 500 volatility, is {vix['price_label']}{change}.{week_clause} "
            f"That is {_vix_band(vix['price'])}."
        )
    else:
        sentences.append("The VIX was unavailable, so this risk note uses the other cross-asset moves.")
    cross = []
    for key, name in (("oil", "WTI crude"), ("gold", "gold"), ("dxy", "the U.S. dollar index")):
        move = moves.get(key)
        if not move:
            continue
        verb = _verb(move.get("session_pct"))
        place = "at" if verb in ("was little changed", "was unavailable") else "to"
        cross.append(f"{name} {verb} {place} {move['price_label']}")
    if cross:
        sentences.append(_sentence(_join(cross)))
    oil = moves.get("oil")
    ten = moves.get("tnx")
    if oil and ten and (oil.get("week_pct") or 0) >= 1 and (ten.get("week_bps") or 0) >= 5:
        sentences.append("Firmer oil can keep inflation, and therefore yields, from easing on their own.")
    if themes:
        sentences.append(f"The newest headlines cluster around {_join(themes)}.")
    sentences.append(
        "Taken together, index moves, the Treasury yield, and volatility describe the backdrop. "
        "They are context for risk, not a signal to trade."
    )
    return " ".join(sentences)


def _watch(moves: dict[str, dict], themes: list[str]) -> list[dict]:
    items: list[dict] = []
    spx = moves.get("spx")
    if spx:
        items.append(
            {
                "name": "S&P 500",
                "reason": (
                    f"Broad U.S. equities {_verb(spx.get('session_pct'))} last session and "
                    f"{_verb(spx.get('week_pct'), 0.1)} over {spx['sessions']} sessions, "
                    "which is the baseline a diversified stock holding is being compared with."
                ),
            }
        )
    if "artificial intelligence" in themes or "earnings and new listings" in themes:
        nasdaq = moves.get("ixic")
        extra = ""
        if nasdaq:
            extra = f" The Nasdaq {_verb(nasdaq.get('session_pct'))} last session."
        if "artificial intelligence" in themes:
            lead = "Headlines are on AI companies, which is a reason to notice how much of the Nasdaq sits in a few large businesses."
        else:
            lead = "Headlines include earnings or new listings, which is a reason to notice how concentrated the growth end of the market is."
        items.append({"name": "Large-cap technology", "reason": lead + extra})
    elif moves.get("ixic"):
        nasdaq = moves["ixic"]
        items.append(
            {
                "name": "Nasdaq Composite",
                "reason": (
                    f"The technology-heavy index {_verb(nasdaq.get('session_pct'))} last session, "
                    "which shows whether that end of the market is moving with the S&P 500 or apart from it."
                ),
            }
        )
    ten = moves.get("tnx")
    if ten:
        week = _yield_verb(ten.get("week_bps"))
        items.append(
            {
                "name": "U.S. 10-year Treasury",
                "reason": (
                    f"The yield finished at {ten['price_label']} and {week} over {ten['sessions']} sessions. "
                    "That is the plain hurdle rate stock prices are measured against."
                ),
            }
        )
    vix = moves.get("vix")
    if vix:
        items.append(
            {
                "name": "Equity volatility (VIX)",
                "reason": (
                    f"At {vix['price_label']}, expected S&P 500 volatility is {_vix_band(vix['price'])}. "
                    "That describes the swings being priced, which is context for time horizon."
                ),
            }
        )
    cross_key = None
    cross_score = 0.0
    for key in ("oil", "gold", "dxy"):
        move = moves.get(key)
        if not move or move.get("week_pct") is None:
            continue
        score = abs(move["week_pct"])
        if score > cross_score:
            cross_score = score
            cross_key = key
    names = {"oil": "Crude oil", "gold": "Gold", "dxy": "U.S. dollar"}
    if cross_key and cross_score >= 0.8:
        move = moves[cross_key]
        reasons = {
            "oil": "Oil is an input cost for households and companies, and it feeds inflation readings that bond yields react to.",
            "gold": "Gold often moves when real yields or the demand for a non-cash store of value shifts.",
            "dxy": "A move in the dollar changes results translated from overseas revenue and the cost of dollar debts.",
        }
        items.append(
            {
                "name": names[cross_key],
                "reason": (
                    f"{move['label']} {_verb(move.get('week_pct'), 0.1)} over {move['sessions']} sessions, to {move['price_label']}. "
                    + reasons[cross_key]
                ),
            }
        )
    elif "geopolitics and trade" in themes:
        items.append(
            {
                "name": "Geopolitics and trade",
                "reason": "Headlines include policy or cross-border risk, which can move energy, the dollar, and company costs without a large index day.",
            }
        )
    return items[:6]


def _format_clock(moment: datetime) -> str:
    local = moment.astimezone(NY)
    hour = local.strftime("%I").lstrip("0") or "12"
    return f"{local.strftime('%b')} {local.day}, {local.year}, {hour}:{local.strftime('%M %p')} ET"


def _format_session(iso_date: str | None) -> str:
    if not iso_date:
        return "the latest available session"
    parsed = date.fromisoformat(iso_date)
    return f"{parsed.strftime('%A')}, {parsed.strftime('%B')} {parsed.day}, {parsed.year}"


def compose(quotes: dict[str, Quote], headlines: list[Headline], generated_at: datetime | None = None) -> dict:
    quotes = _settle(quotes)
    if "spx" not in quotes:
        raise BriefingError("S&P 500 quote missing")
    equity_count = sum(1 for quote in quotes.values() if quote.instrument.group == "equity")
    if equity_count < 2:
        raise BriefingError("not enough equity quotes")
    if "tnx" not in quotes:
        raise BriefingError("10-year yield missing")
    news = [item for item in headlines if item.kind != "fed"]
    if len(news) < 3:
        raise BriefingError("not enough headlines")

    generated_at = generated_at or datetime.now(timezone.utc)
    moves = {key: _move_view(quote) for key, quote in quotes.items()}
    themes = _themes(headlines)
    session_date = quotes["spx"].session_date
    headline_rows = [
        {
            "title": item.title,
            "link": item.link if item.link.startswith(("http://", "https://")) else "",
            "source": item.source,
            "published_label": _format_clock(item.published),
            "summary": item.summary,
        }
        for item in headlines
    ]
    return {
        "origin": "live",
        "notice": None,
        "notice_kind": None,
        "generated_at": generated_at.astimezone(timezone.utc).isoformat(),
        "generated_label": _format_clock(generated_at),
        "session_date": session_date,
        "session_label": _format_session(session_date),
        "disclaimer": DISCLAIMER,
        "moves": [moves[item.id] for item in INSTRUMENTS if item.id in moves],
        "headlines": headline_rows,
        "impact": {
            "stocks": _stocks_impact(moves),
            "rates": _rates_impact(moves),
            "risk": _risk_impact(moves, themes),
        },
        "watch": _watch(moves, themes),
        "sources": [
            {
                "name": "Yahoo Finance chart endpoint",
                "url": "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d",
                "note": "Unattended daily closes for indexes, Treasury yields, VIX, oil, gold, and the dollar. No API key.",
            },
            {
                "name": "CNBC top news RSS",
                "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
                "note": "Public headlines.",
            },
            {
                "name": "CNBC economy RSS",
                "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
                "note": "Public economy headlines.",
            },
            {
                "name": "Federal Reserve press RSS",
                "url": "https://www.federalreserve.gov/feeds/press_all.xml",
                "note": "Included only when a recent release title is about policy or financial conditions.",
            },
        ],
    }


def build_live() -> dict:
    quotes = fetch_quotes()
    headlines = fetch_headlines()
    return compose(quotes, headlines)


def load_sample() -> dict:
    try:
        data = json.loads(SAMPLE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BriefingError(f"sample briefing unreadable: {exc}") from exc
    impact = data.get("impact") or {}
    if not data.get("headlines") or not data.get("watch") or not all(impact.get(key) for key in ("stocks", "rates", "risk")):
        raise BriefingError("sample briefing is incomplete")
    data["origin"] = "sample"
    return data


def _sample_notice(data: dict, failed: bool) -> str:
    when = data.get("generated_label") or "the date stored with the sample"
    session = data.get("session_label") or "the saved session"
    if failed:
        return (
            f"Live market sources did not respond. Showing the saved sample briefing "
            f"captured {when} (last cash session {session})."
        )
    return f"Showing the saved sample briefing captured {when} (last cash session {session})."


def get_briefing(*, force: bool = False, sample_only: bool = False) -> dict:
    """Return a complete briefing. Falls back to the dated sample if live sources fail."""
    if sample_only:
        data = load_sample()
        data["notice"] = _sample_notice(data, failed=False)
        data["notice_kind"] = "sample"
        return data

    now = time.monotonic()
    with _lock:
        cached = _cache["data"]
        if not force and cached is not None and now < _cache["expires"]:
            return cached
        try:
            data = build_live()
            ttl = LIVE_CACHE_SECONDS
        except Exception as exc:
            log.warning("live briefing failed (%s); using sample", exc)
            data = load_sample()
            data["notice"] = _sample_notice(data, failed=True)
            data["notice_kind"] = "fallback"
            ttl = SAMPLE_CACHE_SECONDS
        _cache["data"] = data
        _cache["expires"] = time.monotonic() + ttl
        return data


def clear_cache() -> None:
    with _lock:
        _cache["data"] = None
        _cache["expires"] = 0.0
