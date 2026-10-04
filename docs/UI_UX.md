# PHASE 7 — FRONTEND INFORMATION ARCHITECTURE

**Global state conventions (apply to every page)**

- *Loading*: skeleton placeholders (never a bare spinner on full pages).
- *Error*: inline card "Couldn't load X" + **Retry** button; toast for mutation errors.
- *Empty*: illustration/icon + one sentence + primary action.
- Auth: token in `localStorage`; Axios interceptor adds header; 401 → logout → `/login`.

| Route | Purpose | Key components | Data / API | Empty state |
| --- | --- | --- | --- | --- |
| `/login` | Sign in | Brand panel, form, **Demo Student / Demo Authority** buttons | `POST /auth/login`, `/auth/demo` | — |
| `/student/dashboard` | Overview | StatCards (Open/In progress/Resolved), RecentIssuesList, "Report an issue" CTA, NotificationBell | `GET /issues/mine`, `/notifications` | "You haven't reported anything yet — report your first issue" |
| `/student/report` | Create report | Stepper form, LocationPicker (cascading), CategorySelect with auto-suggest chip, PhotoUploader (preview/remove), **DuplicateSuggestionCard**, SubmitSummary | `GET /meta`, `POST /issues/suggest-category`, `/issues/check-duplicates`, `POST /issues` | Photo optional; location list empty → error |
| `/student/issues` | My issues | FilterTabs (All/Open/Resolved), IssueCard list, StatusBadge, PriorityPill | `GET /issues/mine` | "No issues in this filter" |
| `/student/issues/:id` | Track one issue | IssueHeader, **MergedBanner** ("You + 3 others reported this"), StatusStepper (REPORTED→…→RESOLVED), Timeline, Photos, Remarks | `GET /issues/:id`, `POST /issues/:id/feedback` | 403/404 page |
| `/authority/dashboard` | Control center | StatCards (6), **PriorityQueue** (top 5), TrendChart, CategoryDonut, AgingList, HotspotList | `GET /analytics/overview`, `/authority/issues?sort=priority&limit=5` | "No open issues 🎉" |
| `/authority/issues` | Master list | Filter bar, search, sortable table, bulk-less, pagination, grouped-count badge (`×4`), PriorityPill | `GET /authority/issues`, `/meta` | "No issues match filters" + clear filters |
| `/authority/issues/:id` | Work an issue | IssueSummary, PriorityBreakdown ("why HIGH"), **GroupedReports** panel, SimilarIssues (merge), ActionPanel (assign / status / priority / remark), Timeline, Photo gallery | `GET /issues/:id`, `/authority/issues/:id/similar`, PATCH/POST actions | 404 |
| `/authority/analytics` | Insights | Hotspots bar, byBuilding chart, trend line, aging table, avg resolution | `GET /analytics/overview?days=` | "Not enough data yet" |
| `*` | NotFound | — | — | — |

Shared components: `AppLayout` (sidebar + topbar), `ProtectedRoute`, `StatusBadge`, `PriorityPill`, `StatCard`, `Timeline`, `EmptyState`, `Skeleton`, `ErrorState`, `Toast`, `ConfirmDialog`, `Pagination`, `ImageLightbox`.

---

# PHASE 8 — UI / UX DESIGN

Goal: looks like a real campus-ops SaaS (Linear/Notion-like), not a student form.

**Color system (Tailwind tokens)**

| Role | Color |
| --- | --- |
| Background | `slate-50`, cards `white`, borders `slate-200` |
| Sidebar | `slate-900` with `indigo-400` active item |
| Primary | `indigo-600` (hover `indigo-700`) |
| Text | `slate-900` / `slate-600` / `slate-400` |
| Status | REPORTED `slate` · ASSIGNED `blue` · IN_PROGRESS `amber` · RESOLVED `emerald` · CLOSED `teal` · REJECTED `rose` |
| Priority | LOW `slate` · MEDIUM `sky` · HIGH `orange` · CRITICAL `red` (+ subtle pulsing dot) |

**Typography**: Inter (UI), JetBrains Mono for issue codes (`CF-0042`). Scale: 12 / 14 / 16 / 20 / 28. **Layout**: fixed left sidebar (collapsible to icons on tablet; bottom tab bar on mobile), topbar with search + notification bell + avatar menu. **Cards**: `rounded-xl border bg-white shadow-sm`, 16–24 px padding; stat cards with icon chip and small delta text. **Tables**: sticky header, row hover, left color bar by priority, compact density; collapse to cards on mobile. **Badges**: status = soft-tinted pill with dot; priority = filled pill with level icon. **Duplicate UI**: amber callout card with issue thumbnail, code, status badge, "3 students affected", two buttons. **Timeline**: vertical line, colored dots per event type, relative time ("2h ago") + tooltip absolute time, actor name. **Charts (Recharts)**: indigo line for created, emerald for resolved; donut for category; horizontal bars for hotspots; consistent palette; tooltips on. **Micro-interactions**: toast on actions, skeleton loaders, animated number counters on stat cards, smooth status stepper. **Responsive**: student pages mobile-first (most reports come from phones); authority pages desktop-first with horizontally-scrollable tables on small screens. **Accessibility**: labels on all inputs, focus rings, color never the only signal (icon + text on badges).

---
