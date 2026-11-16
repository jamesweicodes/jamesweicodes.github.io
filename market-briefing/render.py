"""Render a briefing dict as one self-contained HTML page."""

from __future__ import annotations

from html import escape

_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Daily market briefing</title>
<meta name="description" content="What happened in the market, why it matters, and what a long-term investor might watch. Research context, not financial advice.">
<style>
:root {
  --paper: #f3efe6;
  --ink: #1c1914;
  --muted: #5e584e;
  --line: #ddd4c4;
  --card: #fbf8f2;
  --up: #0d5c3d;
  --down: #8d2e2e;
  --flat: #5e584e;
  --accent: #1e3d32;
  --banner: #f6e7c4;
  --banner-line: #e0c98a;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 17px/1.5 "Segoe UI", system-ui, sans-serif;
}
main {
  max-width: 46rem;
  margin: 0 auto;
  padding: 1.5rem 1.1rem 3rem;
}
header.mast h1 {
  font-family: Palatino, "Palatino Linotype", "Iowan Old Style", Georgia, serif;
  font-size: clamp(2rem, 5vw, 2.8rem);
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0.2rem 0 0.4rem;
}
.kicker {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
}
.asof { color: var(--muted); margin: 0.2rem 0 0; }
.badge {
  display: inline-block;
  margin-top: 0.7rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.disclaimer, .banner, .note {
  border-radius: 10px;
  padding: 0.8rem 0.95rem;
}
.disclaimer {
  margin: 1rem 0 0;
  background: var(--card);
  border-left: 4px solid var(--accent);
}
.banner {
  margin: 1rem 0 0;
  background: var(--banner);
  border: 1px solid var(--banner-line);
}
.banner a { font-weight: 600; }
section { margin-top: 2rem; }
h2 {
  font-family: Palatino, "Palatino Linotype", Georgia, serif;
  font-size: 1.55rem;
  margin: 0 0 0.35rem;
}
h2 .num {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-right: 0.35rem;
}
.lede { color: var(--muted); margin: 0 0 0.9rem; }
.moves, .secondary {
  display: grid;
  gap: 0.7rem;
}
.moves { grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); }
.move, .secondary article {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.75rem 0.8rem 0.85rem;
}
.move h3, .secondary h3 {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
}
.price {
  margin: 0.25rem 0 0.15rem;
  font-size: 1.35rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}
.chg, .week { margin: 0; font-size: 0.92rem; font-variant-numeric: tabular-nums; }
.week { color: var(--muted); }
.up { color: var(--up); }
.down { color: var(--down); }
.flat { color: var(--flat); }
.secondary { grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); margin-top: 0.7rem; }
.secondary .price { font-size: 1.05rem; }
ol.news, ol.watch { list-style: none; padding: 0; margin: 0; }
ol.news li, ol.watch li {
  padding: 0.85rem 0;
  border-top: 1px solid var(--line);
}
ol.news li:first-child, ol.watch li:first-child { border-top: 0; }
.news h3, .watch h3 { margin: 0; font-size: 1.05rem; line-height: 1.35; }
.news a, a { color: var(--accent); }
.meta { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.88rem; }
.summary { margin: 0.3rem 0 0; }
.impact article {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-top: 0.7rem;
}
.impact h3 { margin: 0 0 0.35rem; font-size: 1rem; }
.impact p, .watch p { margin: 0; }
.watch h3 { font-size: 1.02rem; }
.color-note, footer { color: var(--muted); font-size: 0.88rem; }
footer { margin-top: 2.2rem; border-top: 1px solid var(--line); padding-top: 1rem; }
footer ul { padding-left: 1.1rem; }
footer li { margin: 0.35rem 0; }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (max-width: 640px) {
  body { font-size: 16.5px; }
  .moves { grid-template-columns: 1fr 1fr; }
  .price { font-size: 1.15rem; }
}
</style>
</head>
<body>
<main>
<header class="mast">
  <p class="kicker">Daily briefing</p>
  <h1>The market, in one page</h1>
  <p class="asof">Last U.S. cash session: @@SESSION@@</p>
  <p class="asof">Figures checked @@GENERATED@@</p>
  <p class="badge">@@ORIGIN@@</p>
</header>
@@BANNER@@
<p class="disclaimer">@@DISCLAIMER@@</p>

<section id="happened" aria-labelledby="happened-title">
  <h2 id="happened-title"><span class="num">1</span>What happened</h2>
  <p class="lede">Main moves from the last cash session, then the change over the five sessions ending that day. Headlines are from public feeds. Futures are lined up to the same stock-market session.</p>
  <div class="moves">@@PRIMARY@@</div>
  <div class="secondary">@@SECONDARY@@</div>
  <p class="color-note">Green and red mark whether the number rose or fell. A higher yield is not the same kind of outcome as a higher stock index.</p>
  <ol class="news">@@HEADLINES@@</ol>
</section>

<section id="matters" class="impact" aria-labelledby="matters-title">
  <h2 id="matters-title"><span class="num">2</span>Why it matters</h2>
  <p class="lede">Plain-language impact on stocks, rates, and risk. This explains the backdrop. It does not say what anyone should do.</p>
  <article>
    <h3>Stocks</h3>
    <p>@@STOCKS@@</p>
  </article>
  <article>
    <h3>Rates</h3>
    <p>@@RATES@@</p>
  </article>
  <article>
    <h3>Risk</h3>
    <p>@@RISK@@</p>
  </article>
</section>

<section id="watch" aria-labelledby="watch-title">
  <h2 id="watch-title"><span class="num">3</span>What to watch</h2>
  <p class="lede">Research context for long-term investing: names and themes, each with one reason. Not a list of things to buy or sell.</p>
  <ol class="watch">@@WATCH@@</ol>
</section>

<footer>
  <p>@@DISCLAIMER@@</p>
  <p>Where the numbers and headlines come from:</p>
  <ul>@@SOURCES@@</ul>
</footer>
</main>
</body>
</html>
"""


def _e(value: object) -> str:
    return escape("" if value is None else str(value), quote=True)


def _move_card(move: dict) -> str:
    direction = move.get("direction") or "flat"
    if direction not in ("up", "down", "flat"):
        direction = "flat"
    word = {"up": "Up", "down": "Down", "flat": "Little changed"}[direction]
    session = str(move.get("session_label") or "")
    if direction == "flat":
        change = f"{word}, {session}" if session else word
    else:
        magnitude = session[1:] if session[:1] in "+-" else session
        change = f"{word} {magnitude}".strip()
    return (
        "<article class=\"move\">"
        f"<h3>{_e(move.get('label'))}</h3>"
        f"<p class=\"price\">{_e(move.get('price_label'))}</p>"
        f"<p class=\"chg {direction}\">{_e(change)}</p>"
        f"<p class=\"week\">{_e(move.get('week_label'))}</p>"
        "</article>"
    )


def _headline_item(item: dict) -> str:
    title = _e(item.get("title"))
    link = item.get("link") or ""
    if link.startswith(("http://", "https://")):
        title_html = f'<a href="{_e(link)}">{title}</a>'
    else:
        title_html = title
    summary = item.get("summary") or ""
    summary_html = f'<p class="summary">{_e(summary)}</p>' if summary else ""
    return (
        "<li>"
        f"<h3>{title_html}</h3>"
        f"<p class=\"meta\">{_e(item.get('source'))} · {_e(item.get('published_label'))}</p>"
        f"{summary_html}"
        "</li>"
    )


def _watch_item(item: dict) -> str:
    return (
        "<li>"
        f"<h3>{_e(item.get('name'))}</h3>"
        f"<p>{_e(item.get('reason'))}</p>"
        "</li>"
    )


def _source_item(item: dict) -> str:
    url = item.get("url") or ""
    name = _e(item.get("name"))
    if url.startswith(("http://", "https://")):
        name = f'<a href="{_e(url)}">{name}</a>'
    return f"<li>{name}. {_e(item.get('note'))}</li>"


def render_page(data: dict) -> str:
    moves = data.get("moves") or []
    primary = "".join(_move_card(item) for item in moves if item.get("primary"))
    secondary = "".join(_move_card(item) for item in moves if not item.get("primary"))
    if not primary:
        primary = "<p>No index quotes in this briefing.</p>"
    notice = data.get("notice")
    if notice:
        retry = '<p><a href="/?refresh=1">Try live sources again</a></p>' if data.get("notice_kind") == "fallback" else '<p><a href="/">Show the live briefing</a></p>'
        banner = f'<p class="banner">{_e(notice)}</p>{retry}'
    else:
        banner = ""
    origin = "Live data" if data.get("origin") == "live" else "Sample data"
    impact = data.get("impact") or {}
    page = _PAGE
    replacements = {
        "@@SESSION@@": _e(data.get("session_label")),
        "@@GENERATED@@": _e(data.get("generated_label")),
        "@@ORIGIN@@": _e(origin),
        "@@BANNER@@": banner,
        "@@DISCLAIMER@@": _e(data.get("disclaimer")),
        "@@PRIMARY@@": primary,
        "@@SECONDARY@@": secondary,
        "@@HEADLINES@@": "".join(_headline_item(item) for item in (data.get("headlines") or [])),
        "@@STOCKS@@": _e(impact.get("stocks")),
        "@@RATES@@": _e(impact.get("rates")),
        "@@RISK@@": _e(impact.get("risk")),
        "@@WATCH@@": "".join(_watch_item(item) for item in (data.get("watch") or [])),
        "@@SOURCES@@": "".join(_source_item(item) for item in (data.get("sources") or [])),
    }
    for token, value in replacements.items():
        page = page.replace(token, value)
    return page
