# Daily market briefing

A single page that answers three questions for the latest U.S. cash session:

1. **What happened** — index, yield, and cross-asset moves, plus headlines.
2. **Why it matters** — plain-language impact on stocks, rates, and risk.
3. **What to watch** — a short list of names and themes for long-term investing, each with one reason.

This is research context, not a buy or sell recommendation. The page says so at the top and again at the bottom.

## Run it

Python 3.11 or newer. No packages to install.

```bash
cd market-briefing
python3 app.py
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

`HOST` and `PORT` change the bind address (defaults: `127.0.0.1` and `8080`). JSON for the same briefing is at `/api/briefing`. Add `?source=sample` to open the saved briefing, or `?refresh=1` to skip the short cache and fetch again.

## Where the data comes from

No API key.

| What | Source |
| --- | --- |
| Index levels, Treasury yields, VIX, WTI crude, gold, U.S. dollar | [Yahoo Finance chart endpoint](https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d), unauthenticated |
| Headlines | [CNBC top news RSS](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114) and [CNBC economy RSS](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258) |
| Policy notes, when a recent title is actually about policy | [Federal Reserve press RSS](https://www.federalreserve.gov/feeds/press_all.xml) |

The server fetches these itself, so the browser does not depend on cross-origin access. A successful live briefing is cached for 10 minutes. "Last session" is the change between the last two daily closes on or before the S&P 500 session, so an overnight futures print does not get mixed with Friday's stock close. "Over 5 sessions" compares that close with the close five sessions earlier.

If a live fetch fails, or the result is missing the S&P 500, the 10-year yield, or enough headlines, the page serves `sample_briefing.json` and says that it is the saved sample, including the date it was captured.

## Tests

```bash
cd market-briefing
python3 -m unittest discover -s tests -t .
```
