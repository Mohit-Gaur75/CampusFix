# PHASE 13 — DEVELOPMENT PHASES (ROADMAP)

Thirteen incremental phases. Every phase ends with a working, testable state.

### P0 — Repo, docs, scaffolding

- **Objective**: Repo with docs, rules, empty client/server that both run.
- **Features**: split blueprint into docs; `client` (Vite+Tailwind) & `server` (Express health route).
- **Files**: `docs/*`, `AGENT_RULES.md`, `README.md`, base configs, `.gitignore`, `.env.example` files.
- **APIs**: `GET /api/health`. **DB**: none.
- **Dependencies**: express, cors, helmet, dotenv, morgan · react-router-dom, axios, tailwindcss, recharts, lucide-react.
- **Output**: `npm run dev` works for both; Tailwind renders.
- **Tests**: health returns 200; client loads.
- **DoD**: docs committed; no secrets in git. **Risks**: Tailwind v4/v3 config mismatch → pin versions.

### P1 — Backend foundation & data models

- **Objective**: Config, DB connection, error handling, all Mongoose models, constants, seed skeleton.
- **Files**: `config/`, `models/*`, `utils/`, `middleware/errorHandler`, `seed/seed.js` (departments + locations only).
- **DB**: all collections/indexes. **Deps**: mongoose, zod.
- **Output**: server connects to Atlas; `npm run seed` loads departments/locations.
- **Tests**: model validation unit tests; connection check. **DoD**: indexes created; consistent error envelope. **Risks**: Atlas IP allow-list → allow 0.0.0.0/0 for hackathon.

### P2 — Authentication & authorization

- **Objective**: JWT login, demo login, role guards.
- **Files**: auth service/controller/routes, `authenticate`, `requireRole`, validators; seed users.
- **APIs**: `/auth/login`, `/auth/demo`, `/auth/me`, `/auth/register` (optional), `/users/me`, `/meta`.
- **Deps**: bcryptjs, jsonwebtoken, express-rate-limit.
- **Tests**: wrong password → 401; student hitting authority route → 403; demo disabled → 403.
- **DoD**: matrix rows for auth pass. **Risks**: token handling; keep secrets in env.

### P3 — Priority engine + issue reporting API

- **Objective**: Students can create issues with photos; priority computed.
- **Files**: `priority.service` (pure), `upload.service`, `issue.service.create`, counters, suggest-category, issues routes (`POST /issues`, `GET /issues/mine`, `GET /issues/:id`).
- **Deps**: multer, cloudinary.
- **Tests**: Phase 16 priority table (unit); upload type/size rejection; ownership on GET.
- **DoD**: creating an issue returns code, priority, timeline entry. **Risks**: Cloudinary config → provide local fallback.

### P4 — Duplicate detection

- **Objective**: Check, link, possiblyRelated, recurrence flag.
- **Files**: `duplicate.service` (pure), `check-duplicates` endpoint, link logic in `issue.service`, notifications on link.
- **Tests**: Phase 16 duplicate table; link updates reportCount + priority.
- **DoD**: demo scenario (light in Room 204) produces 0.80 and links. **Risks**: tuning — keep constants in one file.

### P5 — Authority workflow API

- **Objective**: List/filter/search, assign, status transitions, override, remarks, merge, notifications.
- **Files**: `workflow.service`, authority routes/controllers, notification service/routes.
- **Tests**: every allowed/forbidden transition; merge moves reports; notifications created.
- **DoD**: full demo flow achievable through API (Postman/curl). **Risks**: merge edge cases (already merged, same id).

### P6 — Analytics API

- **Objective**: `/analytics/overview`.
- **Files**: `analytics.service` (aggregations).
- **Tests**: counts match seeded data; empty DB returns zeros. **DoD**: response \< 500 ms on seed. **Risks**: aggregation complexity → compute simple ones in JS if needed.

### P7 — Frontend foundation & auth UI

- **Objective**: Layout, routing, auth context, login page with demo buttons, design system components.
- **Files**: `api/`, `context/`, `components/layout`, `components/ui`, `Login.jsx`, route guards.
- **Tests**: role redirects; 401 logout. **DoD**: both roles can log in and see their empty dashboards. **Risks**: CORS → set `CLIENT_URL`.

### P8 — Student portal

- **Objective**: Dashboard, report form (location picker, upload, auto-suggest, duplicate card), my issues, issue detail + timeline, notifications bell.
- **Tests**: manual report flow; link flow; mobile viewport. **DoD**: student can report and track end to end. **Risks**: debounce/race conditions on duplicate check → cancel stale requests.

### P9 — Authority portal

- **Objective**: Dashboard, issue list with filters, issue detail with action panel, grouped reports, merge.
- **Tests**: assign/status/override flows; student sees updates. **DoD**: demo steps 5–13 work in the UI. **Risks**: large components → split.

### P10 — Analytics UI & polish

- **Objective**: Charts, hotspots, aging, animations, empty/loading/error states, responsive pass.
- **DoD**: no un-styled states; Lighthouse sanity; screenshots taken.

### P11 — Seed data, tests, demo hardening

- **Objective**: Realistic seed (Phase 17), `seed:reset`, unit/API tests, demo script rehearsal.
- **DoD**: reset takes \< 10 s; all tests pass; demo run-through succeeds 3× in a row.

### P12 — Deployment

- **Objective**: Atlas + Render + Vercel/Netlify live; README + DEPLOYMENT.md.
- **DoD**: live URLs work with demo accounts; cold-start mitigated (keep-alive ping before demo). **Risks**: CORS, env vars, Cloudinary prod keys, SPA rewrites (`/*` → `index.html`).

---

## Status log
- [ ] Phase 0: Setup & Docs
- [ ] Phase 1: Database & Models
