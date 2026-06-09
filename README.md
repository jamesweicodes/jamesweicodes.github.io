# jameswei.me

Personal portfolio site for James Wei — deployed via GitHub Pages at [jameswei.me](https://jameswei.me).

## Project Structure

```
├── index.html                  # Portfolio homepage
├── assets/
│   ├── css/site.css            # Custom styles (glass cards, animations, a11y)
│   ├── js/
│   │   ├── main.js             # Content rendering, nav, dock, scroll reveals
│   │   ├── background.js       # Three.js animated background
│   │   └── copilot.js          # Portfolio-aware AI assistant
│   └── data/portfolio.json     # Single source of truth for site content
├── lab/
│   └── script-generator/       # Real estate copy generator demo
├── CNAME                       # Custom domain (jameswei.me)
└── README.md
```

## Local Preview

From the repo root:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Features

- **Dynamic content** — Experience, Lab ventures, stack, and contact info loaded from `portfolio.json`
- **Nexus Context AI** — Portfolio-aware Q&A assistant (keyword routing, no backend required)
- **Lab demo** — Real Estate Script Generator at `/lab/script-generator/`
- **Mobile nav** — Hamburger menu for small screens
- **Accessibility** — Skip link, focus states, reduced-motion support
- **SEO** — Open Graph tags, JSON-LD Person schema, canonical URL

## Deployment

Push to `main` on GitHub. GitHub Pages serves the root directory with the custom domain from `CNAME`.

No build step required — static HTML, CSS, and JS only.

## Optional: Live Gemini API

The current AI copilot uses embedded portfolio data with keyword matching (works on GitHub Pages with no backend). To upgrade to live Gemini responses:

1. Create a Cloudflare Worker (or similar serverless proxy) that holds your Gemini API key
2. Point `copilot.js` at the proxy endpoint instead of local `matchIntent()`
3. Never expose API keys in client-side code

See [Google AI Studio](https://aistudio.google.com/) for Gemini API setup.
