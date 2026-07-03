# AGENTS.md

## Cursor Cloud specific instructions

This repo is a personal portfolio for James Wei with two independently runnable pieces:

- **Frontend (primary product):** Next.js 15 (App Router) + TypeScript + Tailwind v4. This is the main deliverable (deployed to GitHub Pages as a static export). Run/lint/build via the `package.json` scripts (`npm run dev` → http://localhost:3000, `npm run lint`, `npm run build`). Uses Node 22 (matches CI in `.github/workflows/deploy.yml`).
- **Backend (optional):** FastAPI + Gemini in `backend/`. It is optional — the frontend runs fully standalone. The Nexus Context AI copilot and the Property Intelligence tool both have client-side engines (`src/lib/nexus-engine.ts`, `src/lib/property-intelligence.ts`), so no backend or API key is needed to demo the UI.

### Non-obvious caveats

- The backend must be started from the repo root (not the `backend/` dir) because `backend/main.py` imports `from middleware import ...` and `from backend.property_intelligence import ...` using the repo root on the path. Run: `python3 -m uvicorn backend.main:app --reload --port 8000`.
- Python deps are installed to the user site with `--break-system-packages`; the `uvicorn`/`fastapi` console scripts land in `~/.local/bin`, which is not on `PATH` by default. Use `python3 -m uvicorn ...` to avoid PATH issues.
- The `/api/nexus/query` backend endpoint requires `GEMINI_API_KEY` (returns HTTP 503 without it). The `/health` and `/api/property/intelligence` endpoints work without any key; the latter calls public US Census / FCC geocoding APIs and degrades gracefully when offline.
- `next.config.ts` sets `output: "export"` (static export), so `npm run build` writes to `/out` and there is no server runtime — the frontend is fully static.
