# jameswei.me — Portfolio (Next.js)

Personal portfolio for **James Robert Wei** — Program Manager, AI Builder, Cinematographer.

**Theme:** *The Era of Implementation*

Deployed at [jameswei.me](https://jameswei.me) via GitHub Pages.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Fonts | Inter, Instrument Serif, Space Grotesk |
| Deploy | Static export → GitHub Pages |

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Design tokens & Tailwind theme
│   ├── layout.tsx       # Root layout, fonts, metadata
│   └── page.tsx         # Home page (scaffold preview)
├── components/
│   ├── layout/          # Navbar (Step 2)
│   ├── sections/        # Hero, Experience, Projects, Media, Contact
│   └── ui/              # GeometricBackground, shared UI
└── lib/
    └── site-data.ts     # Content model (single source of truth)
public/
└── CNAME                # Custom domain
legacy/                  # Previous static site (reference + lab demo)
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/jamesweicodes/jamesweicodes.github.io.git
cd jamesweicodes.github.io

# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Production build (outputs to /out for GitHub Pages)
npm run build
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#050508` | Page background |
| `--color-accent` | `#0ea5e9` | Primary CTA, links, glow |
| `--color-tesla` | `#e31937` | Tesla / enterprise accents |
| `--font-serif` | Instrument Serif | Hero headings |
| `--font-sans` | Inter | Body copy |
| `--font-display` | Space Grotesk | Labels, UI |

Utility classes: `glass-panel`, `text-gradient-accent`, `section-padding`, `container-main`

## Build Roadmap

- [x] **Step 1** — Scaffold, design tokens, content model
- [x] **Step 2** — Hero + Navigation + geometric background
- [x] **Step 3** — Experience timeline + AI project cards
- [ ] **Step 4** — Videography gallery + contact footer

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the static export and deploys to GitHub Pages.

> **Note:** Enable GitHub Pages → Source: **GitHub Actions** in repo Settings.

## Legacy

The previous static HTML site lives in `/legacy` for reference. The real estate script generator demo is preserved at `/legacy/lab/script-generator/` and copied into the build output during CI.
