# PHASE 3 — SYSTEM ARCHITECTURE

## 3.1 Diagram

```
 Student (browser)                Authority (browser)
        \                               /
         v                             v
 +---------------------------------------------------+
 |   React + Vite + Tailwind SPA (Vercel/Netlify)    |
 |   React Router · Axios (JWT interceptor) · Recharts|
 +---------------------------------------------------+
                      | HTTPS / JSON (+ multipart for photos)
                      v
 +---------------------------------------------------+
 |        Express API  (Render / Railway)            |
 |  middleware: cors · helmet · rate-limit · auth ·  |
 |              role guard · validate (zod) · errors |
 |---------------------------------------------------|
 |  routes → controllers → services → models         |
 |   ├─ auth.service         (JWT, bcrypt, demo login)|
 |   ├─ issue.service        (create/link, queries)   |
 |   ├─ duplicate.service    (pure similarity fns)    |
 |   ├─ priority.service     (pure scoring fns)       |
 |   ├─ workflow.service     (assign/status/merge,    |
 |   │                        transition rules,timeline)|
 |   ├─ notification.service (in-app records)         |
 |   ├─ analytics.service    (Mongo aggregations)     |
 |   └─ upload.service       (Cloudinary | local)     |
 +---------------------------------------------------+
        |                                  |
        v                                  v
 +----------------+                +------------------+
 | MongoDB Atlas  |                | Cloudinary (free)|
 | users, issues, |                | (dev: ./uploads) |
 | reports, depts,|                +------------------+
 | locations,     |
 | notifications  |
 +----------------+
```

## 3.2 Layer decisions

| Layer | Decision | Why |
| --- | --- | --- |
| Frontend | React SPA, role-based route guards, Axios instance with JWT interceptor, Recharts | Known stack, fast |
| Backend | Single modular monolith; **pure functions** for priority + duplicate scoring | Testable, explainable, no framework magic |
| Database | MongoDB Atlas M0 (free), Mongoose | Flexible docs, embedded timeline |
| Auth | JWT (7-day expiry, in `Authorization: Bearer`), bcrypt, `DEMO_MODE` demo-login endpoint | Simple; demo-safe |
| File storage | **Cloudinary free tier** via multer memory storage → `upload_stream`. Dev fallback: local disk `server/uploads` served statically (\`STORAGE_DRIVER=local | cloudinary\`). Max 3 files, 5 MB, jpeg/png/webp |
| API layer | REST, JSON, consistent envelope `{success, data, error:{code,message,details}}` | Predictable for frontend and agent |
| Business logic | In `services/`, never in controllers/routes | Maintainable |
| Duplicate detection | Deterministic weighted score (Phase 9) | No AI dependency |
| Notifications | Notification documents + bell polling every 20s | Zero infra, visible in demo |
| Analytics | Single `GET /analytics/overview` using Mongo aggregation | One call, fast dashboard |

---

# PHASE 12 — PROJECT FOLDER STRUCTURE

```
campusfix/
├─ README.md
├─ AGENT_RULES.md
├─ docs/                       # Phase 11 files
├─ client/                     # React + Vite + Tailwind
│  ├─ index.html
│  ├─ .env.example             # VITE_API_URL
│  └─ src/
│     ├─ main.jsx, App.jsx     # router + providers
│     ├─ api/                  # axios instance + one file per resource (auth, issues, authority, analytics)
│     ├─ context/              # AuthContext (user, token, login, logout)
│     ├─ hooks/                # useDebounce, useFetch, useNotifications
│     ├─ components/
│     │  ├─ layout/            # AppLayout, Sidebar, Topbar, ProtectedRoute
│     │  ├─ ui/                # Button, Card, Badge, StatusBadge, PriorityPill, Skeleton, EmptyState, ErrorState, Toast, Modal
│     │  ├─ issues/            # IssueCard, IssueTable, Timeline, StatusStepper, PhotoUploader, LocationPicker, DuplicateSuggestionCard, GroupedReports, PriorityBreakdown, ActionPanel
│     │  └─ charts/            # TrendChart, CategoryDonut, HotspotBar
│     ├─ pages/
│     │  ├─ Login.jsx, NotFound.jsx
│     │  ├─ student/           # Dashboard, ReportIssue, MyIssues, IssueDetail
│     │  └─ authority/         # Dashboard, Issues, IssueDetail, Analytics
│     └─ utils/                # constants (statuses, colors), formatters (dates, ids)
└─ server/
   ├─ package.json, .env.example
   └─ src/
      ├─ server.js             # start + DB connect
      ├─ app.js                # express app, middleware, routes mount
      ├─ config/               # env.js (validated), db.js, cloudinary.js
      ├─ models/               # User, Department, Location, Issue, Report, Notification, Counter
      ├─ routes/               # auth, users, meta, issues, authority, analytics, notifications
      ├─ controllers/          # thin: parse → call service → respond
      ├─ services/             # auth, issue, duplicate, priority, workflow, notification, analytics, upload
      ├─ middleware/           # authenticate, requireRole, validate, upload, errorHandler, rateLimit
      ├─ validators/           # zod schemas
      ├─ utils/                # ApiError, asyncHandler, constants (enums, category weights, phrase map, stopwords)
      ├─ seed/                 # seed.js, data/*.json (or .js)
      └─ tests/                # unit/ (priority, duplicate, transitions), api/ (supertest)
```

Rules: controllers never contain business logic; `priority.service` and `duplicate.service` are **pure** (no DB) so they can be unit-tested and explained.

---
