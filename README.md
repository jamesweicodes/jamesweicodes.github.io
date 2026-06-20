# jameswei.me — Cinematic Portfolio v2.0

Personal portfolio for **James Robert Wei** — Program Manager, AI Builder, Cinematographer.

**Theme:** *The Era of Implementation* — cinematic execution at enterprise scale.

Live at [jameswei.me](https://jameswei.me)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom cinematic design system |
| UI | shadcn-style primitives (Button, Badge, Card) |
| Animation | Framer Motion + Lenis smooth scroll |
| Forms | React Hook Form + Zod (Lab tools) |
| Icons | Lucide React |
| AI | Nexus Context AI (client + optional FastAPI/Gemini backend) |
| Deploy | GitHub Pages (CI) · Vercel-ready |

## Project Structure

```
src/
├── app/
│   ├── globals.css           # Cinematic tokens, film grain, light mode
│   ├── layout.tsx            # Providers, SEO, JSON-LD
│   ├── page.tsx              # Single-page portfolio
│   └── lab/                  # Premium AI copy + project planning tools
├── components/
│   ├── cinematic/            # Typewriter, orbit icons, counters, scroll progress
│   ├── layout/               # Glassmorphic navbar + active section
│   ├── nexus/                # Nexus Context AI copilot
│   ├── sections/             # Hero, Experience, Projects, Media, Contact
│   └── ui/                   # shadcn-style primitives
├── lib/
│   ├── site-data.ts          # Content model
│   ├── nexus-engine.ts       # Portfolio AI responses
│   ├── animations.ts         # Framer Motion variants
│   └── utils.ts              # cn() helper
backend/                      # FastAPI + Gemini (optional)
public/CNAME                  # jameswei.me
legacy/                       # Previous static site archive
```

## Features

- **Cinematic Hero** — Video background, film grain, typewriter subtitle, orbiting tech icons
- **Sticky Nav** — Glassmorphism, active section highlight, theme toggle, mobile drawer
- **Tesla Experience** — Animated metrics, filterable bento grid, expandable timeline
- **Selected Work** — Filter by PM / AI / Film
- **AI Lab** — Project cards + rebuilt script generator with form validation
- **Project Launch Planner** — Client-side MVP scope, architecture, risk, and launch copy generator
- **Media Gallery** — Masonry grid with lightbox
- **Nexus Context AI** — Floating copilot with guardrails
- **Polish** — Lenis scroll, scroll progress bar, reduced-motion support, SEO

## Getting Started

```bash
git clone https://github.com/jamesweicodes/jamesweicodes.github.io.git
cd jamesweicodes.github.io
npm install
npm run dev          # http://localhost:3000
npm run build        # outputs to /out
```

## Deployment

### GitHub Pages (current)
Push to `main` → `.github/workflows/deploy.yml` builds and deploys.

Settings → Pages → Source: **GitHub Actions**

### Vercel (recommended for SSR/API later)
```bash
npx vercel
```
Remove `output: 'export'` from `next.config.ts` if using server features.

## Nexus AI Backend (optional)

```bash
pip install -r backend/requirements.txt
GEMINI_API_KEY=your_key uvicorn backend.main:app --reload --port 8000
```

Set `NEXT_PUBLIC_NEXUS_API_URL` at build time for live Gemini responses.

## Customization

- **Content:** Edit `src/lib/site-data.ts`
- **Hero video:** Replace CDN URL in `src/components/sections/Hero.tsx` or add `/public/videos/hero.mp4`
- **Resume:** Add `public/resume.pdf` and update Hero CTA link
- **Colors:** Design tokens in `src/app/globals.css` `@theme` block

## Domain

Keep **jameswei.me** — strong personal brand, already configured via `public/CNAME`.
