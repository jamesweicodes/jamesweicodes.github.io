# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single Next.js 15 portfolio app (`jameswei.me`) with optional FastAPI/Gemini backend for Nexus AI. No database, Docker, or automated test suite.

### Required service (minimum E2E)

| Service | Port | Command |
|---------|------|---------|
| Next.js dev server | 3000 | `npm run dev` |

Nexus uses the client-side keyword engine by default. The Script Generator at `/lab/script-generator/` runs entirely in the browser.

### Optional service

| Service | Port | Command |
|---------|------|---------|
| Nexus FastAPI backend | 8000 | `GEMINI_API_KEY=<key> uvicorn backend.main:app --reload --port 8000` |

Requires `GEMINI_API_KEY` and `NEXT_PUBLIC_NEXUS_API_URL=http://localhost:8000` for live Gemini responses. `uvicorn` installs to `~/.local/bin` via pip; add that to `PATH` if the command is not found.

### Common commands

See `README.md` and `package.json` for full details:

- **Install (frontend):** `npm ci`
- **Install (backend):** `pip install -r backend/requirements.txt`
- **Dev server:** `npm run dev` (Turbopack, http://localhost:3000)
- **Lint:** `npm run lint`
- **Build:** `npm run build` (static export to `/out`)
- **Production preview:** `npm run build` then serve `out/` (e.g. `npx serve out`)

### Gotchas

- `next.config.ts` uses `output: "export"` — static export only; no SSR/API routes in the Next app.
- `npm start` is not the primary local workflow; use `npm run dev` for development.
- Hero background video loads from an external CDN; the site falls back to gradient/mesh if unavailable.
- No pre-commit hooks or test scripts are configured in this repo.
