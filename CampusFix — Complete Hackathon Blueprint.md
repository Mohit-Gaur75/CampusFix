# CampusFix — Complete Hackathon Blueprint

> Working product name: **CampusFix** (rename freely). Stack: React + Vite + Tailwind · Node + Express · MongoDB Atlas · JWT. Save this file in your repo as `docs/BLUEPRINT.md`. Phase P0 of the Antigravity prompts splits it into the documentation set from Phase 11.

---

# PHASE 0 — PRODUCT UNDERSTANDING

## 0.1 Problem

Campus issues (broken lights, Wi-Fi, leaks, hostel maintenance, sanitation) are reported through WhatsApp, calls and verbal messages. There is no single place where an issue is recorded, owned, prioritized and tracked to resolution.

## 0.2 Target users

| User | Needs |
| --- | --- |
| Student | Report fast (under 60 seconds), know it was received, see progress |
| Authority (estate office / maintenance supervisor) | One queue, clear urgency, assign work, close the loop |
| Admin (optional) | Maintain departments, locations, users — handled by seed data in MVP |

## 0.3 Current pain points → how CampusFix answers them

| # | Pain point (from problem statement) | CampusFix answer |
| --- | --- | --- |
| 1 | Students don't know where/whom to report | One form; category + department auto-suggested |
| 2 | Complaints get lost in chats | Every report becomes a record with an ID (`CF-0042`) |
| 3 | No status tracking | Status + timeline + in-app notifications |
| 4 | No central admin view | Authority dashboard = control center |
| 5 | Same problem reported repeatedly | Duplicate detection at submission + grouping under one **Issue** |
| 6 | Hard to know what's urgent | Deterministic, explainable priority score |
| 7 | No visibility on recurring problems | Analytics: hotspots, recurring locations, aging issues |

## 0.4 Proposed solution

A web platform where a student files a **Report** (location + category + description + photo). The system checks whether an open **Issue** already covers it. If yes, the student can attach their report to it ("+1, I'm affected too"); if not, a new Issue is created. Priority is computed automatically and rises as more students are affected or time passes. Authorities work on **Issues**, not on raw messages.

## 0.5 Core value proposition

> "Instead of 40 WhatsApp messages about the same broken light, the campus gets **one** tracked issue with a clear owner, priority, and status."

## 0.6 The single most important design decision: Issue vs Report

- **Report** = one student's submission (who, when, their photo/description).
- **Issue** = the underlying real-world problem (one broken light) that many reports can point to.
- Authorities manage Issues. Students see Issues they reported/joined. Priority is computed on the Issue using the number of linked reports.

## 0.7 What should NOT be built in the MVP

- Microservices, message queues, Redis, websockets (use polling/refetch)
- Paid AI APIs or image classification (keyword rules only)
- Email/SMS/push notifications (in-app only; email is an optional wow)
- Complex RBAC/permissions UI, multi-campus tenancy
- Staff mobile app, SLA contracts, billing/inventory
- Full admin CRUD screens (seed departments/locations; admin = optional)
- Chat between student and authority (remarks + timeline are enough)

---

# PHASE 1 — MVP SCOPE

Legend: **MUST** = demo breaks without it · **SHOULD** = strong demo value, cheap · **NICE** = if time remains · **OUT** = not in MVP

| Feature | User | Priority | MVP / Optional | Reason |
| --- | --- | --- | --- | --- |
| Login (email+password, JWT) | All | MUST | MVP | Role separation |
| One-click demo login buttons | All | MUST | MVP | Smooth judge demo |
| Student registration | Student | NICE | Optional | Seeded accounts suffice |
| Report issue form (category, location, description) | Student | MUST | MVP | Core |
| Photo upload (1–3 images) | Student | MUST | MVP | Required by problem statement |
| Cascading location picker (building → floor → room) | Student | MUST | MVP | Enables duplicate matching |
| Auto-suggest category from description | Student | SHOULD | MVP | "System categorizes it" demo step |
| Live duplicate check before submit | Student | MUST | MVP | Key differentiator |
| "Link to existing issue" confirmation | Student | MUST | MVP | Human-in-the-loop dedupe |
| Student dashboard (my issues, counts) | Student | MUST | MVP | Tracking |
| Issue detail + timeline | Student | MUST | MVP | Tracking |
| "Merged with existing issue" banner + affected count | Student | MUST | MVP | Required by scope |
| In-app notifications (bell) | Student | SHOULD | MVP | Shows status change instantly |
| Confirm resolved / reopen | Student | NICE | Optional | Closes loop |
| Authority dashboard (stat cards, priority queue, charts) | Authority | MUST | MVP | Control center |
| Issue list with filter/search/sort | Authority | MUST | MVP | Core |
| Issue detail with grouped reports | Authority | MUST | MVP | Shows dedupe |
| Assign department (+ staff name) | Authority | MUST | MVP | Required |
| Change status (validated transitions) | Authority | MUST | MVP | Required |
| Override priority (with reason) | Authority | SHOULD | MVP | Human control |
| Remarks (visible to student toggle) | Authority | SHOULD | MVP | Communication |
| Merge two issues manually | Authority | SHOULD | MVP | Covers 0.50–0.74 band |
| Analytics (summary, by category, by location, trend, aging) | Authority | MUST | MVP | Required |
| Hotspot / recurring locations | Authority | SHOULD | MVP | Required insight |
| Recurring issue flag (same place re-broken ≤30 days) | Authority | NICE | Optional | Cheap wow |
| Department/location management UI | Admin | OUT | Seed only | Not demo-critical |
| User management UI | Admin | OUT | — | — |
| Email/SMS notifications | All | OUT | Optional wow | External dependency |
| QR code per location | Student | NICE | Optional wow | Strong demo |
| Heatmap | Authority | NICE | Optional wow | Visual |
| AI/image classification | — | OUT | — | Violates "no paid AI" |

## 1.1 Issue lifecycle

```
REPORTED ──assign──▶ ASSIGNED ──start──▶ IN_PROGRESS ──fix──▶ RESOLVED ──confirm──▶ CLOSED
    │                    │                    │                    │
    └──────── reject (note required) ─────────┴──▶ REJECTED        └──reopen──▶ IN_PROGRESS
```

| Status | In MVP? | Notes |
| --- | --- | --- |
| REPORTED | Yes | Auto-set on creation. **System auto-triage** (category, priority, suggested department) happens here, so a separate TRIAGED state adds no value. |
| TRIAGED | **No** | Merged into REPORTED + auto-triage. Mention in demo as "triaged automatically". |
| ASSIGNED | Yes | Set when authority assigns a department |
| IN_PROGRESS | Yes | Work started |
| RESOLVED | Yes | Authority marks fixed (sets `resolvedAt`) |
| CLOSED | Optional | Student confirms, or auto-close after 3 days. Keep enum value, UI button optional |
| REJECTED | Yes | Invalid/out of scope; note required |
| DUPLICATE | **Not an issue status** | Duplicate is a *report-level* link (report points to an existing issue). A manually merged issue gets `mergedInto` and is hidden from lists. |

Allowed transitions (enforced server-side):

```
REPORTED:    ASSIGNED, REJECTED
ASSIGNED:    IN_PROGRESS, REJECTED
IN_PROGRESS: RESOLVED, REJECTED
RESOLVED:    CLOSED, IN_PROGRESS (reopen)
CLOSED/REJECTED: (terminal)
```

Assigning a department while REPORTED auto-moves it to ASSIGNED.

---

# PHASE 2 — USER JOURNEYS

## 2.1 Student

1. Opens `/login` → clicks **Login as Student (demo)** or enters credentials.
2. Lands on `/student/dashboard`: counts (Open / In progress / Resolved), recent issues, notification bell.
3. Clicks **Report an issue**.
4. Picks building → floor → room; types description ("Ceiling light not working").
5. System suggests category (Electrical) — student can change it.
6. Uploads a photo (preview shown).
7. As description/location settle (debounced), a **"Similar issue already reported"** card appears with the matching issue, its status, and report count.
8. Student chooses **"Yes, same problem — add my report"** (links) or **"No, this is different"** (creates a new issue, flagged as possibly related).
9. Submit → success screen with Issue ID, computed priority, and outcome ("Linked to CF-0042 — 3 students affected").
10. Opens `/student/issues/:id` → sees status, assigned department, timeline, authority remarks.
11. Receives a notification when status changes; sees RESOLVED with resolution time.
12. (Optional) Confirms resolution or reopens.

## 2.2 Authority

1. Logs in (demo button) → `/authority/dashboard`.
2. Sees stat cards (Total, Open, In progress, Critical, Avg resolution time), priority queue (top 5 unresolved by score), trend chart, category chart.
3. Opens **All issues** → filters (status, priority, category, building), searches, sorts by priority/age/reports.
4. Opens an issue → sees details, photos, location, priority breakdown ("why HIGH?"), grouped reports with count, timeline.
5. Assigns department + staff (suggested department pre-selected) → status becomes ASSIGNED.
6. Changes status to IN_PROGRESS, adds a remark ("Electrician visiting at 3 PM").
7. Optionally overrides priority with reason, or merges a "possibly related" issue.
8. Marks RESOLVED with note.
9. Opens **Analytics** → hotspots, recurring locations, aging issues, resolution trends.

## 2.3 Admin (optional, minimal)

Admin = Authority + ability to see all departments. In MVP admin is a seeded account that can use all authority screens; no separate admin screens. Departments/locations/users are changed through the seed file.

---

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

# PHASE 4 — DATABASE DESIGN

Collections: `users`, `departments`, `locations`, `issues`, `reports`, `notifications`. (No separate `categories` collection — categories are a constant enum shared via `/meta`.) Timeline and priority breakdown are **embedded** in `issues` (always read together).

**Relationship model**

```
user 1──* report *──1 issue *──1 location
                        issue *──1 department
issue.mergedInto ──▶ issue (manual merge)
```

## 4.1 `users`

Purpose: all roles.

| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| name | String | ✔ |  |
| email | String | ✔ | unique, lowercase |
| passwordHash | String | ✔ | bcrypt, `select:false` |
| role | Enum `STUDENT\|AUTHORITY\|ADMIN` | ✔ |  |
| department | ObjectId→departments | ✖ | authority's home department |
| rollNo | String | ✖ | student |
| hostel | String | ✖ |  |
| phone | String | ✖ |  |
| isDemo | Boolean | ✖ |  |
| createdAt/updatedAt | Date | auto |  |

Indexes: `{email:1}` unique; `{role:1}`.

```json
{ "_id":"u1","name":"Aarav Sharma","email":"aarav@campusfix.demo","role":"STUDENT","rollNo":"CS24B012","hostel":"Boys Hostel A" }
```

## 4.2 `departments`

Purpose: assignment targets + category→department routing.

| Field | Type | Req |
| --- | --- | --- |
| name | String | ✔ (unique) |
| code | String | ✔ (`ELEC`, `PLUMB`, `IT`, `HK`, `CIVIL`, `ESTATE`) |
| categories | \[String\] | ✔ — categories this department handles |
| staff | \[{ name, phone }\] | ✖ |
| Indexes: `{code:1}` unique. |  |  |

```json
{ "name":"Electrical Maintenance","code":"ELEC","categories":["ELECTRICAL"],"staff":[{"name":"Ramesh Kumar","phone":"98xxxxxx01"}] }
```

## 4.3 `locations`

Purpose: structured locations (enables reliable duplicate matching and analytics).

| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| building | String | ✔ | "CS Block" |
| floor | String | ✔ | "Floor 2" |
| area | String | ✔ | "Room 204" |
| zoneType | Enum `CLASSROOM\|LAB\|LIBRARY\|HOSTEL\|MESS\|COMMON\|SPORTS` | ✔ |  |
| criticality | Number 1–5 | ✔ | feeds priority |
| label | String | auto | "CS Block · Floor 2 · Room 204" |
| Indexes: `{building:1,floor:1,area:1}` unique. |  |  |  |

## 4.4 `issues` (underlying issue)

Purpose: the unit authorities manage.

| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| code | String | ✔ | `CF-0001`, unique, from counter |
| title | String | ✔ | derived from first description (first 80 chars) |
| description | String | ✔ | from primary report |
| category | Enum | ✔ | ELECTRICAL, PLUMBING, NETWORK, SANITATION, FURNITURE, STRUCTURAL, EQUIPMENT, OTHER |
| location | ObjectId→locations | ✔ |  |
| locationSnapshot | {building,floor,area,label} | ✔ | denormalized for fast lists |
| keywords | \[String\] | ✔ | normalized tokens (used for similarity) |
| photos | \[String\] | ✖ | up to 4 URLs (aggregated from reports) |
| status | Enum | ✔ | default REPORTED |
| priority | {score:Number, level:Enum LOW\|MEDIUM\|HIGH\|CRITICAL, breakdown:{safety,affected,location,category,age}, overridden:Boolean, overrideReason:String} | ✔ |  |
| reportCount | Number | ✔ | default 1 |
| reporters | \[ObjectId→users\] | ✔ | unique reporter ids |
| primaryReport | ObjectId→reports | ✔ |  |
| department | ObjectId→departments | ✖ |  |
| suggestedDepartment | ObjectId→departments | ✔ | by category |
| assignedStaff | String | ✖ |  |
| possiblyRelated | \[{issue:ObjectId, score:Number}\] | ✖ | the 0.50–0.74 band |
| mergedInto | ObjectId→issues | ✖ | set when manually merged |
| recurrenceOf | ObjectId→issues | ✖ | resolved issue ≤30 days ago, same place/category |
| timeline | \[{type:`CREATED\|REPORT_LINKED\|ASSIGNED\|STATUS\|PRIORITY\|REMARK\|MERGED`, fromStatus, toStatus, note, visibleToStudent:Boolean, actor:{id,name,role}, at:Date}\] | ✔ |  |
| resolvedAt, closedAt | Date | ✖ |  |
| createdAt/updatedAt | Date | auto |  |

Indexes: `{code:1}` unique · `{status:1,"priority.score":-1}` (priority queue) · `{location:1,category:1,status:1}` (duplicate lookup) · `{createdAt:-1}` · `{reporters:1}` · text index on `title, description` (search).

```json
{
 "code":"CF-0042","title":"Ceiling light not working","category":"ELECTRICAL",
 "location":"loc204","locationSnapshot":{"building":"CS Block","floor":"Floor 2","area":"Room 204","label":"CS Block · Floor 2 · Room 204"},
 "keywords":["ceiling","light","fault"],"status":"IN_PROGRESS",
 "priority":{"score":52,"level":"HIGH","breakdown":{"safety":0,"affected":24,"location":9,"category":10,"age":9},"overridden":false},
 "reportCount":4,"reporters":["u1","u2","u3","u4"],"department":"depElec","assignedStaff":"Ramesh Kumar",
 "timeline":[{"type":"CREATED","at":"2026-10-01T09:10Z","actor":{"name":"Aarav Sharma","role":"STUDENT"}},
             {"type":"REPORT_LINKED","note":"Priya Das reported the same issue","at":"2026-10-01T10:00Z"},
             {"type":"ASSIGNED","note":"Electrical Maintenance · Ramesh Kumar","toStatus":"ASSIGNED"},
             {"type":"STATUS","fromStatus":"ASSIGNED","toStatus":"IN_PROGRESS","visibleToStudent":true}]
}
```

## 4.5 `reports` (one student submission)

| Field | Type | Req | Notes |
| --- | --- | --- | --- |
| issue | ObjectId→issues | ✔ | the underlying issue this report belongs to |
| reporter | ObjectId→users | ✔ |  |
| description | String | ✔ | 10–500 chars |
| category | Enum | ✔ | as chosen by student |
| location | ObjectId→locations | ✔ |  |
| photos | \[String\] | ✖ | max 3 |
| isPrimary | Boolean | ✔ | first report of the issue |
| dedupe | {score:Number, band:`PROBABLE\|RELATED\|NONE`, matchedIssue:ObjectId, decision:`NEW\|LINKED_BY_USER\|IGNORED_SUGGESTION`, breakdown:{category,location,keyword}} | ✔ | audit of the decision (great for judges) |
| createdAt | Date | auto |  |
| Indexes: `{issue:1,createdAt:1}` · `{reporter:1,createdAt:-1}` · unique `{issue:1,reporter:1}` (one report per student per issue). |  |  |  |

## 4.6 `notifications`

| Field | Type |
| --- | --- |
| user | ObjectId→users |
| issue | ObjectId→issues |
| type | `STATUS_CHANGED\|ASSIGNED\|REMARK\|LINKED\|PRIORITY_CHANGED` |
| message | String |
| read | Boolean (default false) |
| createdAt | Date |
| Indexes: `{user:1,read:1,createdAt:-1}`. Created for every reporter in `issue.reporters` on student-visible events. |  |

## 4.7 Counter

`counters` collection `{_id:"issue", seq:Number}` incremented with `findOneAndUpdate($inc)` to produce `CF-0001`.

## 4.8 How many reports belong to one issue

Student B's report is stored as a new `reports` doc with `issue = A._id`, `dedupe.decision = LINKED_BY_USER`. Then `issue.reportCount++`, `issue.reporters.push(B)`, photo appended, priority recomputed, timeline entry `REPORT_LINKED`, authority sees "4 reports", students see "4 students affected".

---

# PHASE 5 — API DESIGN

Base URL `/api`. All responses: `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`. Common errors: `400 VALIDATION_ERROR` · `401 UNAUTHENTICATED` · `403 FORBIDDEN` · `404 NOT_FOUND` · `409 INVALID_TRANSITION / CONFLICT` · `413/415 UPLOAD_ERROR` · `429 RATE_LIMITED` · `500 SERVER_ERROR`. Auth column: **P** public · **A** any logged-in · **S** student · **U** authority/admin.

## 5.1 Auth & profile

| Method | URL | Auth | Body / Query | Response | Errors | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /auth/login | P | `{email,password}` | `{token,user}` | 400, 401 | Login |
| POST | /auth/demo | P | `{role:"STUDENT"\|"AUTHORITY"}` | `{token,user}` | 403 if `DEMO_MODE≠true` | One-click demo |
| POST | /auth/register | P | `{name,email,password,rollNo?}` | `{token,user}` | 400, 409 email exists | Optional student signup |
| GET | /auth/me | A | — | `{user}` | 401 | Restore session |
| PATCH | /users/me | A | `{name?,phone?,hostel?}` | `{user}` | 400 | Profile update |

## 5.2 Meta (dropdown data)

| GET | /meta | A | — | `{categories[], statuses[], priorities[], departments[], locations[{_id,building,floor,area,label,zoneType}]}` | — | Populates forms/filters in one call |

## 5.3 Student issues

| Method | URL | Auth | Body / Query | Response | Errors | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /issues/suggest-category | S | `{description}` | `{category, confidence}` | 400 | Keyword-based category suggestion |
| POST | /issues/check-duplicates | S | `{category,locationId,description}` | `{candidates:[{issue:{_id,code,title,status,reportCount,locationSnapshot}, score, band, breakdown}]}` (max 3, score ≥0.50) | 400 | Live duplicate preview |
| POST | /issues | S | multipart: `category, locationId, description, photos[0..3], linkToIssueId?` | `{outcome:"CREATED"\|"LINKED", issue, report}` | 400; 409 already reported this issue; 404 link target; 409 target closed | Submit. Server **recomputes** duplicate score (never trusts client). If `linkToIssueId` given and valid → LINKED. Else new issue; any candidates 0.50+ stored in `possiblyRelated`. |
| GET | /issues/mine | S | `status?, page?, limit?` | `{items[], total, page}` | — | Issues the student has a report on |
| GET | /issues/:id | A | — | `{issue, reports, timeline}` — student: only if they have a report on it; timeline filtered to `visibleToStudent`; other reporters' names hidden. Authority: full. | 403, 404 | Detail |
| POST | /issues/:id/feedback | S | `{action:"CONFIRM"\|"REOPEN", note?}` | `{issue}` | 409 if not RESOLVED | Optional close loop |
| GET | /notifications | A | `unreadOnly?` | `{items[], unreadCount}` | — | Bell |
| PATCH | /notifications/read | A | `{ids?:[...]}` (omit = all) | `{updated}` | — | Mark read |

## 5.4 Authority issues & workflow

| Method | URL | Auth | Body / Query | Response | Errors | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /authority/issues | U | `status, priority, category, building, department, q, minReports, sort(priority\|newest\|oldest\|reports), page, limit` | `{items[], total, page}` (excludes `mergedInto` issues) | 400 | Master list / priority queue |
| GET | /authority/issues/:id/similar | U | — | `{candidates[]}` (open issues scoring ≥0.50) | 404 | Merge suggestions |
| PATCH | /authority/issues/:id/assign | U | `{departmentId, staffName?, note?}` | `{issue}` | 400, 404, 409 terminal status | Assign (REPORTED→ASSIGNED automatically) |
| PATCH | /authority/issues/:id/status | U | `{status, note?}` (note required for REJECTED/RESOLVED) | `{issue}` | 400, 409 `INVALID_TRANSITION`, 409 department required for IN_PROGRESS | Change status |
| PATCH | /authority/issues/:id/priority | U | `{level, reason}` (reason required) | `{issue}` | 400 | Manual override |
| POST | /authority/issues/:id/remarks | U | `{text, visibleToStudent:boolean}` | `{issue}` | 400 | Remark |
| POST | /authority/issues/:id/merge | U | `{sourceIssueId}` | `{issue}` (target) | 400 same id, 409 already merged/terminal | Merge source into this issue: move reports, recompute priority, set `source.mergedInto` |

## 5.5 Analytics

| GET | /analytics/overview | U | `days?=30` | `{summary:{total,open,inProgress,resolved,critical,avgResolutionHours,overdueCount}, byCategory[], byBuilding[], hotspots[{location,count,openCount,recurrences}], trend[{date,created,resolved}], aging[{issue}], byStatus[]}` | 400 | One call powers dashboard + analytics page |

**Total ≈ 22 endpoints.** Admin CRUD endpoints deliberately omitted.

## 5.6 Cross-cutting rules

- Validation with **zod** schemas per route; reject unknown fields.
- `helmet`, `cors` (allow only `CLIENT_URL`), `express-rate-limit` (global 200/15min; auth 20/15min; `POST /issues` 30/hour).
- Every authority mutation appends a timeline entry and, when student-visible, creates notifications.

---

# PHASE 6 — AUTHORIZATION

| Capability | Student | Authority | Admin |
| --- | --- | --- | --- |
| Login / view own profile | ✔ | ✔ | ✔ |
| Submit report / link to existing issue | ✔ | ✖ | ✖ |
| View issues they reported | ✔ (own only) | — | — |
| View all issues | ✖ | ✔ | ✔ |
| See other reporters' identities | ✖ | ✔ | ✔ |
| See internal (non-student-visible) remarks | ✖ | ✔ | ✔ |
| Assign department/staff | ✖ | ✔ | ✔ |
| Change status / priority | ✖ | ✔ | ✔ |
| Merge issues | ✖ | ✔ | ✔ |
| Confirm / reopen resolved issue | ✔ (own) | ✔ | ✔ |
| View analytics | ✖ | ✔ | ✔ |
| Manage departments/locations/users | ✖ | ✖ | ✔ (seed-only in MVP) |

Implementation: `authenticate` middleware (verify JWT, load user) + `requireRole(...roles)`; ownership check in `issue.service.assertCanView(user, issue)`. Frontend `ProtectedRoute` redirects by role, but **the server is the source of truth**.

---

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

# PHASE 9 — DUPLICATE DETECTION DESIGN

## 9.1 Input

`{ category, locationId, description }` of the new report + candidate pool of existing issues.

## 9.2 Candidate pool (cheap DB filter first)

Open issues (`status ∈ REPORTED, ASSIGNED, IN_PROGRESS`, `mergedInto` null) with **same category** and **same building**; plus RESOLVED issues in last 30 days with same category and same room (used only for the *recurrence* flag). Typically \< 30 documents.

## 9.3 Normalization

1. Lowercase, strip punctuation.
2. Replace phrases with canonical tokens (`not working|broken|damaged|dead|fused|faulty|stopped|out of order|not functioning` → `fault`; `wi-fi|wifi|internet|network|no signal` → `network`; `tube light|tubelight|bulb|lamp|light` → `light`; `leak|leaking|dripping|seepage` → `leak`; `ceiling fan|fan` → `fan`; `tap|faucet` → `tap`; `toilet|washroom|restroom` → `washroom`; …).
3. Remove stopwords (`the, a, is, in, at, of, on, and, there, it, my, our, near, to, very`…).
4. Tokenize → unique set.

## 9.4 Feature extraction

- `categoryMatch` = 1 if equal else 0
- `locationScore` = 1.0 same location · 0.6 same building + same floor · 0.3 same building · 0
- `keywordSimilarity` = Jaccard(tokensA, tokensB)

## 9.5 Similarity

```
score = 0.25*categoryMatch + 0.35*locationScore + 0.40*keywordSimilarity
```

## 9.6 Gates (keep the engine explainable and avoid silly matches)

- category differs → `score = min(score, 0.49)`
- keywordSimilarity == 0 → `score = min(score, 0.49)`
- locationScore \< 0.6 (different floor/building) → `score = min(score, 0.74)` (can be "related", never "probable")

## 9.7 Thresholds

| Score | Band | Behavior |
| --- | --- | --- |
| ≥ 0.75 | PROBABLE | Student sees prominent "Same problem?" card, default action = link |
| 0.50 – 0.74 | RELATED | Softer card "Possibly related"; if student still creates new issue, store in `possiblyRelated` so authority can merge |
| \< 0.50 | NONE | Ignore |

## 9.8 Candidate generation → grouping → confirmation

1. On the report form (debounced 600 ms), call `/issues/check-duplicates`; show up to 3 candidates.
2. Student picks **"Yes, same problem"** → submit includes `linkToIssueId`.
3. Server recomputes score; if it is below 0.50 it still honors the link only if the issue exists/open (human decision wins) but records the real score.
4. Linking: new `reports` doc → `issue.reportCount++`, reporter added, photo appended, priority recomputed, timeline `REPORT_LINKED`, notification to existing reporters ("2 more students reported this").
5. If the student rejects → new issue created; `possiblyRelated` filled; `report.dedupe.decision = IGNORED_SUGGESTION`.
6. Authority can later **merge** issue B into A.

## 9.9 Database representation

`reports.issue` points to the grouping issue; `reports.dedupe` stores score/band/breakdown/decision; `issues.possiblyRelated`, `issues.mergedInto`, `issues.recurrenceOf`.

## 9.10 UI representation

- Student form: amber card with matched issue + "x students affected" + status.
- Student detail: banner "Merged with an existing report — 4 students are tracking this".
- Authority list: `×4` badge next to title. Authority detail: "Grouped reports (4)" panel, each with reporter, time, photo, similarity score chip; "Possibly related issues" panel with **Merge** button.

## 9.11 Pseudocode

```js
function normalize(text) {
  let t = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  for (const [pattern, canon] of PHRASE_MAP) t = t.replace(pattern, canon);
  return new Set(t.split(/\s+/).filter(w => w && !STOPWORDS.has(w)));
}
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  const inter = [...a].filter(x => b.has(x)).length;
  return inter / (a.size + b.size - inter);
};
function locationScore(a, b) {
  if (a.id === b.id) return 1.0;
  if (a.building === b.building && a.floor === b.floor) return 0.6;
  if (a.building === b.building) return 0.3;
  return 0;
}
function similarity(input, issue) {
  const c = input.category === issue.category ? 1 : 0;
  const l = locationScore(input.location, issue.location);
  const k = jaccard(normalize(input.description), new Set(issue.keywords));
  let score = 0.25*c + 0.35*l + 0.40*k;
  if (!c || k === 0) score = Math.min(score, 0.49);
  if (l < 0.6)       score = Math.min(score, 0.74);
  const band = score >= 0.75 ? 'PROBABLE' : score >= 0.5 ? 'RELATED' : 'NONE';
  return { score: round2(score), band, breakdown: { category: c, location: l, keyword: round2(k) } };
}
```

## 9.12 Worked examples

| # | A (existing) | B (new) | cat | loc | kw | Score | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Electrical · Room 204 · "Ceiling light not working" → {ceiling, light, fault} | Electrical · Room 204 · "Broken light in classroom" → {light, fault, classroom} | 1 | 1.0 | 2/4=0.50 | 0.25+0.35+0.20 = **0.80** | PROBABLE |
| 2 | Electrical · Room 204 · "Ceiling fan not working" {ceiling, fan, fault} | same room · "Fan making loud noise" {fan, loud, noise} | 1 | 1.0 | 1/5=0.20 | 0.25+0.35+0.08 = **0.68** | RELATED |
| 3 | Electrical · Room 204 · "Light not working" | Electrical · Room 207 same floor · "Light not working" | 1 | 0.6 | 1.0 | 0.25+0.21+0.40 = **0.86** (floor gate not triggered) | PROBABLE (student can still reject) |
| 4 | Electrical · CS Block F2 · "Light not working" | Electrical · CS Block F3 · "Light not working" | 1 | 0.3 | 1.0 | 0.25+0.105+0.40 = 0.755 → capped 0.74 | **RELATED** |
| 5 | Electrical · Room 204 | Plumbing · Room 204 | 0 | 1.0 | any | capped 0.49 | NONE |
| 6 | Electrical · Room 204 "Switchboard sparking" | Electrical · Room 204 "Light not working" | 1 | 1.0 | 0 | capped 0.49 | NONE |

---

# PHASE 10 — PRIORITY ENGINE

Deterministic, explainable, 0–100 points. Recomputed whenever an issue is created, a report is linked, an issue is merged, and on every read of the authority list/dashboard for **age** (compute on the fly or via a light `recomputeAll()` on dashboard load — no cron needed).

## 10.1 Formula

```
score = min(100, safety + affected + location + category + age)
```

| Factor | Range | Rule |
| --- | --- | --- |
| **Safety** | 0–35 | Severe keyword (`spark, sparking, short circuit, exposed wire, fire, smoke, shock, gas, flood, collapse, snake, glass`) = **35** · Moderate keyword (`leak, leakage, slippery, loose, wet, overflow, foul, mosquito`) = **15** · else 0 |
| **Affected users** | 0–25 | `min(25, 3 + (reportCount − 1) × 7)` → 1 report=3, 2=10, 3=17, 4=24, 5+=25 |
| **Location criticality** | 3–15 | `location.criticality (1–5) × 3` (mess/hostel/lab/library higher) |
| **Category weight** | 4–14 | ELECTRICAL 10 · PLUMBING 12 · NETWORK 10 · SANITATION 12 · STRUCTURAL 14 · EQUIPMENT 8 · FURNITURE 4 · OTHER 4 |
| **Age (unresolved)** | 0–15 | `min(15, floor(daysOpen) × 3)`; 0 once RESOLVED/CLOSED |

## 10.2 Level mapping

| Score | Level |
| --- | --- |
| ≥ 65 | CRITICAL |
| 45–64 | HIGH |
| 25–44 | MEDIUM |
| \< 25 | LOW |

Authority override stores `overridden=true` + reason; automatic recompute then updates `score`/`breakdown` but **keeps the overridden level** until the authority resets it.

## 10.3 Worked examples

| Case | Safety | Affected | Location | Category | Age | Total | Level |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Broken light, CS Block Room 204 (crit 3), 1 report, day 0 | 0 | 3 | 9 | 10 | 0 | **22** | LOW |
| Same, now 3 reports | 0 | 17 | 9 | 10 | 0 | **36** | MEDIUM |
| Same, 4 reports, open 3 days | 0 | 24 | 9 | 10 | 9 | **52** | HIGH |
| Sparking socket, Hostel room (crit 4), 1 report | 35 | 3 | 12 | 10 | 0 | **60** | HIGH |
| Same, 2 reports | 35 | 10 | 12 | 10 | 0 | **67** | CRITICAL |
| Water leakage, Library hall (crit 4), 3 reports, 2 days | 15 | 17 | 12 | 12 | 6 | **62** | HIGH |
| Wi-Fi down, Academic zone (crit 3), 5 reports, 1 day | 0 | 25 | 9 | 10 | 3 | **47** | HIGH |
| Loose bench, Canteen (crit 3), 1 report, day 0 | 0 | 3 | 9 | 4 | 0 | **16** | LOW |

**Demo story:** the broken light climbs LOW → MEDIUM → HIGH as students join — visible live.

---

# PHASE 11 — DOCUMENTATION STRUCTURE

All docs live in `docs/` (except README). Antigravity must read them before every phase.

| File | Why it exists | Contents | Used by | Update when |
| --- | --- | --- | --- | --- |
| `README.md` | First impression for judges + setup | Pitch, screenshots, stack, run instructions, demo accounts, live links | Judges, teammates | Final polish, after deploy |
| `docs/PROJECT_OVERVIEW.md` | Shared understanding | Phase 0 (problem, users, value, non-goals) | Everyone | Scope changes |
| `docs/REQUIREMENTS.md` | Scope contract | Phase 1 table, lifecycle, transitions | You, Antigravity | Feature added/cut |
| `docs/ARCHITECTURE.md` | Technical map | Phase 3 diagram, layers, request flow, error envelope, env vars | Antigravity | Architecture changes |
| `docs/DATABASE_DESIGN.md` | Schema truth | Phase 4 | Antigravity | Any schema/index change |
| `docs/API_DOCUMENTATION.md` | Endpoint contract | Phase 5 (+ examples as built) | Frontend + backend work | Any endpoint change |
| `docs/AUTHORIZATION.md` | Security contract | Phase 6 matrix + middleware approach | Antigravity, reviewers | Role/permission change |
| `docs/DUPLICATE_DETECTION.md` | Differentiator explanation | Phase 9 + test table | Judges, Antigravity | Weights/thresholds change |
| `docs/PRIORITY_ENGINE.md` | Explainability | Phase 10 + examples | Judges, Antigravity | Formula change |
| `docs/UI_UX.md` | Design system | Phase 7 + 8 (pages, tokens, components) | Antigravity | Design changes |
| `docs/DEVELOPMENT_PLAN.md` | Roadmap + progress | Phase 13 with checkboxes and status log | You | After every phase |
| `docs/DEMO_FLOW.md` | Demo reliability | Phase 17 data + Phase 18 script + reset steps | Presenter | After seed/UI changes |
| `docs/DEPLOYMENT.md` | Reproducible deploy | Atlas, Cloudinary, Render, Vercel steps, env vars, troubleshooting | You | After deploy changes |
| `docs/TESTING.md` | Quality evidence | Phase 16 matrix + results log | You, judges | After each test run |
| `docs/DECISIONS.md` | Why we chose X | Short ADR list (e.g., "Issue vs Report", "no TRIAGED status", "deterministic dedupe") | Judges Q&A | When a decision is made |
| `AGENT_RULES.md` (+ pasted into Antigravity project instructions) | Keeps the coding agent disciplined | Phase 15 block | Antigravity | Rules change |

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

# PHASE 14 — ANTIGRAVITY PROMPTS

How to use: (1) Paste the Phase 15 rules into Antigravity's project instructions once. (2) Run one prompt at a time, in order. (3) After each phase, run the verification yourself, commit, tick the box in `docs/DEVELOPMENT_PLAN.md`, then move on. Don't skip the testing step — it protects the demo.

Every prompt ends with the same **STANDING BLOCK** so each one is copy-paste independent.

## P0 prompt — Repo, docs, scaffolding

```
PHASE P0 — Project setup, documentation, scaffolding (CampusFix hackathon MVP)

OBJECTIVE
Create the monorepo skeleton, split the blueprint into the documentation set, and make an empty client and server run.

ALREADY EXISTS
A repo containing only docs/BLUEPRINT.md (the complete product + technical blueprint) and possibly AGENT_RULES.md.

READ FIRST
docs/BLUEPRINT.md fully (all phases).

CREATE
1. Split BLUEPRINT.md into these files under docs/ (copy content faithfully, do not invent features): PROJECT_OVERVIEW.md (Phase 0), REQUIREMENTS.md (Phase 1), ARCHITECTURE.md (Phase 3 + Phase 12 folder structure), DATABASE_DESIGN.md (Phase 4), API_DOCUMENTATION.md (Phase 5), AUTHORIZATION.md (Phase 6), UI_UX.md (Phases 7+8), DUPLICATE_DETECTION.md (Phase 9), PRIORITY_ENGINE.md (Phase 10), DEVELOPMENT_PLAN.md (Phase 13 with a checkbox per phase + empty "Status log"), DEMO_FLOW.md (Phases 17+18), TESTING.md (Phase 16), DEPLOYMENT.md (stub), DECISIONS.md (seed with: Issue vs Report; no TRIAGED status; DUPLICATE is not an issue status; deterministic dedupe and priority; Cloudinary with local fallback; single analytics endpoint). Keep docs/BLUEPRINT.md as-is.
2. AGENT_RULES.md (copy the rules block from Phase 15 of the blueprint).
3. README.md: project pitch (3 lines), stack, folder structure, "how to run" placeholders, demo accounts placeholder.
4. server/: npm init, Express app split into src/server.js and src/app.js, GET /api/health returning {success:true,data:{status:"ok"}}, helmet, cors (origin from CLIENT_URL), morgan, dotenv, central error handler stub, nodemon dev script, .env.example (PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, DEMO_MODE, STORAGE_DRIVER, CLOUDINARY_*).
5. client/: Vite + React + Tailwind CSS + react-router-dom + axios + recharts + lucide-react; a placeholder home page proving Tailwind works; .env.example with VITE_API_URL.
6. Root .gitignore (node_modules, .env, uploads, dist).

CONSTRAINTS
Pin dependency versions that work together (Tailwind config must match installed major version). No extra libraries. No business logic yet.

VERIFY
`cd server && npm run dev` → GET /api/health works. `cd client && npm run dev` → page renders with Tailwind styling. `git status` shows no .env files.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P1 prompt — Backend foundation & models

```
PHASE P1 — Backend foundation, config, Mongoose models, seed skeleton

OBJECTIVE
Implement environment config, MongoDB connection, error-handling utilities, all Mongoose models with indexes, shared constants, and a seed script for departments and locations.

ALREADY EXISTS
P0: monorepo, docs/, server with /api/health, client scaffold.

READ FIRST
docs/DATABASE_DESIGN.md, docs/ARCHITECTURE.md, docs/PRIORITY_ENGINE.md, docs/DUPLICATE_DETECTION.md (for constants).

CREATE / MODIFY (server/src)
- config/env.js: load and validate env vars with zod; fail fast with a clear message.
- config/db.js: mongoose.connect with logging; server.js starts only after DB connects.
- utils/ApiError.js, utils/asyncHandler.js, middleware/errorHandler.js (envelope {success:false,error:{code,message,details}}; handle zod, Mongoose validation/duplicate-key/cast errors, unknown errors without leaking stack in production).
- utils/constants.js: enums (ROLES, CATEGORIES, STATUSES, PRIORITY_LEVELS, ZONE_TYPES, TIMELINE_TYPES), CATEGORY_WEIGHTS, ALLOWED_TRANSITIONS, SEVERE_KEYWORDS, MODERATE_KEYWORDS, PHRASE_MAP and STOPWORDS (for duplicate detection), CATEGORY_KEYWORDS (for suggest-category), CATEGORY_TO_DEPARTMENT_CODE.
- models/: User, Department, Location, Issue, Report, Notification, Counter exactly as in DATABASE_DESIGN.md including indexes, timestamps, passwordHash select:false, and Location.label auto-generation.
- seed/seed.js + seed/data/departments.js + seed/data/locations.js (use the Phase 17 lists in docs/DEMO_FLOW.md). Script must be idempotent (upsert by unique key). Add npm scripts: seed, dev, start.

CONSTRAINTS
No routes beyond /health yet. Do not add auth or business logic. Keep constants in ONE file so thresholds/weights are easy to tune.

TESTS
Add jest (+ mongodb-memory-server) config. Write model tests: required-field validation, unique email, unique {issue,reporter} on reports, enum rejection.

VERIFY
Server connects to Atlas using .env; `npm run seed` twice produces no duplicates; `npm test` passes.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P2 prompt — Authentication & authorization

```
PHASE P2 — JWT authentication, demo login, role-based access, /meta

OBJECTIVE
Implement login, demo login, session restore, profile update and role guards, plus the /meta endpoint.

ALREADY EXISTS
P0–P1: server foundation, models, constants, seed for departments/locations, error handler, jest setup.

READ FIRST
docs/API_DOCUMENTATION.md (5.1, 5.2), docs/AUTHORIZATION.md.

CREATE / MODIFY
- services/auth.service.js (hash/compare with bcryptjs, sign/verify JWT with JWT_SECRET and JWT_EXPIRES_IN), controllers/auth.controller.js, routes/auth.routes.js, routes/users.routes.js, routes/meta.routes.js.
- middleware/authenticate.js (Bearer token → load user, 401 on missing/invalid/expired), middleware/requireRole.js, middleware/validate.js (zod wrapper), validators/auth.validators.js.
- middleware/rateLimit.js: auth limiter (20 per 15 min) and a global limiter.
- POST /api/auth/login, POST /api/auth/demo (only when DEMO_MODE=true; role STUDENT or AUTHORITY → logs in the first seeded user of that role), POST /api/auth/register (STUDENT only; optional), GET /api/auth/me, PATCH /api/users/me, GET /api/meta (categories, statuses, priorities, departments, locations).
- Extend seed with users: 6 students, 2 authorities, 1 admin (see docs/DEMO_FLOW.md; password Demo@123, bcrypt-hashed).

CONSTRAINTS
Never return passwordHash. Use the same generic message for wrong email vs wrong password. Do not trust a role sent by the client on register. Register mounted routes in app.js without altering existing middleware order.

TESTS (supertest)
login success/failure; demo login enabled/disabled; /me with no/invalid/expired token; student calling a requireRole('AUTHORITY') test route → 403; register duplicates → 409; passwordHash never in responses.

VERIFY
Use curl/Postman to log in as seeded student and authority; call /auth/me and /meta with the token.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P3 prompt — Priority engine + issue reporting API

```
PHASE P3 — Priority engine, photo upload, issue creation and student issue APIs

OBJECTIVE
Let a student create an issue (with photos) and fetch their issues. Compute priority deterministically. Duplicate linking comes in P4, so for now every submission creates a new issue.

ALREADY EXISTS
P0–P2: foundation, models, auth, role guards, /meta, seeded users/locations/departments.

READ FIRST
docs/PRIORITY_ENGINE.md, docs/DATABASE_DESIGN.md (issues, reports, counters), docs/API_DOCUMENTATION.md (5.3), docs/DUPLICATE_DETECTION.md section 9.3 (normalization is reused).

CREATE / MODIFY
- services/priority.service.js: PURE functions computePriority({description, category, location, reportCount, createdAt, status, now}) → {score, level, breakdown}; levelFromScore(score). Use constants only.
- utils/text.js: normalize(text) → Set of tokens (phrase map + stopwords). Export for P4.
- services/upload.service.js: multer memory storage; validate mimetype (jpeg/png/webp), max 3 files, 5 MB each; STORAGE_DRIVER=cloudinary uses upload_stream (folder campusfix) and returns secure_url; STORAGE_DRIVER=local writes to server/uploads and serves /uploads statically. config/cloudinary.js.
- services/issue.service.js: createIssue (generates CF-0001 via counters, creates Issue + primary Report, snapshot location, keywords from normalize, suggestedDepartment by category, priority, CREATED timeline entry); getMyIssues; getIssueById with ownership check (students only if they have a report on it; hide internal timeline entries and other reporters' identities).
- POST /api/issues/suggest-category (keyword match against CATEGORY_KEYWORDS), POST /api/issues (multipart), GET /api/issues/mine, GET /api/issues/:id. Validators with zod (description 10–500 chars, valid category and location ObjectId).
- Add 30/hour rate limit on POST /api/issues.

CONSTRAINTS
Never trust client-supplied priority/status/reporter. Reject non-image files. Clean up nothing on failure beyond avoiding partial DB writes (create report only after issue succeeds; use a transaction only if Atlas supports it, otherwise order writes safely).

TESTS
Unit: every row of the priority table in docs/TESTING.md and docs/PRIORITY_ENGINE.md (exact scores); level boundaries 24/25, 44/45, 64/65; keyword detection; age cap. API: create issue happy path; invalid category; description too short; oversize/invalid file; another student cannot GET my issue (403); authority can.

VERIFY
Create an issue via Postman with a photo; the response shows code CF-000N, priority breakdown and timeline. GET /issues/mine lists it.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P4 prompt — Duplicate detection

```
PHASE P4 — Duplicate detection, report linking, related issues, recurrence flag

OBJECTIVE
Detect duplicates before submission, let a student link their report to an existing issue, and store related/recurring info.

ALREADY EXISTS
P0–P3: issue creation, priority engine (pure), text normalization util, upload, student issue endpoints.

READ FIRST
docs/DUPLICATE_DETECTION.md (all), docs/DATABASE_DESIGN.md (reports.dedupe, issues.possiblyRelated, recurrenceOf), docs/API_DOCUMENTATION.md (check-duplicates, POST /issues).

CREATE / MODIFY
- services/duplicate.service.js: PURE functions locationScore, keywordSimilarity (Jaccard), similarity(input, issue) with the exact weights (0.25/0.35/0.40), the three gates, and band thresholds (0.75 / 0.50). Plus findCandidates(input) in issue.service or a thin DB function: open issues (REPORTED/ASSIGNED/IN_PROGRESS, not merged) with same category and same building, return top 3 with score ≥ 0.50. Constants from utils/constants.js only.
- POST /api/issues/check-duplicates (student).
- Update POST /api/issues: accept optional linkToIssueId. If provided and the target is open: create a Report on that issue (decision LINKED_BY_USER), increment reportCount, add reporter (reject with 409 if the student already reported it), append photos (cap 4 on issue), recompute priority via priority.service, add REPORT_LINKED timeline entry, create notifications for existing reporters (Notification model; helper in services/notification.service.js). Return {outcome:"LINKED"}. Otherwise create a new issue, store candidates ≥0.50 in possiblyRelated, set report.dedupe.decision = IGNORED_SUGGESTION when candidates existed, and recurrenceOf when a RESOLVED issue (≤30 days) matches category + same location with score ≥0.75. Return {outcome:"CREATED"}.
- Server recomputes the score; never trusts a client score.

CONSTRAINTS
Do not change the priority formula. Do not change P2/P3 contracts other than the documented additions. Keep similarity code free of DB calls.

TESTS
Unit tests for all 6 worked examples in docs/DUPLICATE_DETECTION.md (exact expected scores 0.80, 0.68, 0.86, 0.74-cap, 0.49-cap, 0.49-cap); normalization cases ("not working"/"broken" → fault; "tube light"/"bulb" → light). API: link flow increments reportCount, escalates priority (1→3 reports moves 22 → 36), duplicate link by same student → 409, linking to a CLOSED issue → 409/400, possiblyRelated populated.

VERIFY
Seed + create "Ceiling light not working" in CS Block Room 204; as another student call check-duplicates with "Broken light in classroom" → score 0.80 PROBABLE; submit with linkToIssueId → issue reportCount 2.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P5 prompt — Authority workflow API

```
PHASE P5 — Authority issue management API

OBJECTIVE
Give authorities list/filter/search, assignment, status transitions, priority override, remarks, merge, similar-issue lookup, and student notifications.

ALREADY EXISTS
P0–P4: auth, issue creation, duplicate detection, notification service/model, priority engine.

READ FIRST
docs/API_DOCUMENTATION.md (5.3 notifications, 5.4), docs/REQUIREMENTS.md (lifecycle + ALLOWED_TRANSITIONS), docs/AUTHORIZATION.md, docs/PRIORITY_ENGINE.md (override behavior).

CREATE / MODIFY
- services/workflow.service.js: assignIssue, changeStatus (validate against ALLOWED_TRANSITIONS; note required for REJECTED and RESOLVED; IN_PROGRESS requires a department; set resolvedAt/closedAt), overridePriority (reason required; overridden=true keeps level on recompute), addRemark, mergeIssues(targetId, sourceId), findSimilarForIssue. Every action appends a timeline entry with actor {id,name,role}; student-visible ones also create Notifications for all issue.reporters.
- routes/authority.routes.js (+controllers, validators) with requireRole('AUTHORITY','ADMIN'): GET /authority/issues (filters status, priority, category, building, department, q (text search), minReports, sort priority|newest|oldest|reports, pagination; exclude mergedInto), GET /authority/issues/:id/similar, PATCH assign, PATCH status, PATCH priority, POST remarks, POST merge.
- Merge: move source reports to target (respect unique {issue,reporter}; skip duplicates reporters but count them once), recompute reportCount/reporters/photos/priority, set source.mergedInto + timeline MERGED on both, notify reporters of both.
- GET/PATCH /api/notifications endpoints.
- POST /api/issues/:id/feedback (CONFIRM → CLOSED, REOPEN → IN_PROGRESS) for the student who reported it.
- On authority list/detail reads, refresh priority age component without overriding an overridden level.

CONSTRAINTS
Server-side transition enforcement only through ALLOWED_TRANSITIONS. Students must get 403 on all authority routes. Don't alter response shapes from earlier phases.

TESTS
All allowed and forbidden transitions (table-driven); assign auto-moves REPORTED→ASSIGNED; RESOLVED without note → 400; override + recompute keeps level; merge moves reports and reporters correctly and hides source from list; notifications created for every reporter; student visibility filtering of timeline; role tests per docs/AUTHORIZATION.md.

VERIFY
Run the full demo flow via Postman: create → link → assign → in-progress → remark → resolve; confirm notifications for both students.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P6 prompt — Analytics API

```
PHASE P6 — Analytics API

OBJECTIVE
Implement GET /api/analytics/overview powering the authority dashboard and analytics page.

ALREADY EXISTS
P0–P5: complete backend workflow and seeded data (extend seed only if needed to exercise analytics).

READ FIRST
docs/API_DOCUMENTATION.md (5.5), docs/DATABASE_DESIGN.md.

CREATE / MODIFY
- services/analytics.service.js using Mongo aggregation (or simple JS reduction if clearer): summary {total, open (REPORTED+ASSIGNED+IN_PROGRESS), inProgress, resolved (RESOLVED+CLOSED), critical (open with level CRITICAL), avgResolutionHours (resolvedAt − createdAt), overdueCount (open > 7 days)}, byCategory, byStatus, byBuilding, hotspots (per location: total count, openCount, recurrences = issues with recurrenceOf or ≥2 issues same category, top 5), trend (daily created/resolved for last `days`, fill missing days with 0), aging (oldest 5 unresolved).
- routes/analytics.routes.js + controller + validator (days 7–90, default 30), requireRole authority/admin. Exclude merged issues from all counts.

CONSTRAINTS
One endpoint, one response. No new collections. Keep each aggregation readable.

TESTS
With a small deterministic fixture: exact counts; empty DB → zeros and empty arrays (not errors); trend fills gaps; student → 403.

VERIFY
Call the endpoint after seeding and check numbers against a manual count in Mongo.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P7 prompt — Frontend foundation & auth UI

```
PHASE P7 — Frontend foundation: design system, routing, auth

OBJECTIVE
Build the app shell, reusable UI components, auth flow and role-based routing in the client.

ALREADY EXISTS
P0–P6: Vite+React+Tailwind scaffold; complete backend API (auth, issues, authority, analytics).

READ FIRST
docs/UI_UX.md (pages + design system), docs/API_DOCUMENTATION.md (5.1, 5.2), docs/AUTHORIZATION.md.

CREATE / MODIFY (client/src)
- api/axios.js (baseURL from VITE_API_URL, Authorization interceptor, 401 → logout + redirect), api/auth.js, api/meta.js.
- context/AuthContext.jsx (user, token, login, demoLogin, logout, restore session via /auth/me on load; loading state).
- Tailwind theme tokens per docs/UI_UX.md; add Inter and JetBrains Mono via fonts.
- components/layout: AppLayout (dark sidebar + topbar + avatar menu; mobile bottom nav for student), ProtectedRoute(roles).
- components/ui: Button, Card, Badge, StatusBadge, PriorityPill (with pulsing dot for CRITICAL), StatCard, Skeleton, EmptyState, ErrorState, Toast provider, Modal/ConfirmDialog, Pagination.
- utils/constants.js: status/priority color maps, labels, formatters (relative time, issue code).
- pages: Login (brand panel, email/password form, "Demo Student" and "Demo Authority" buttons), NotFound, placeholder dashboards for /student/dashboard and /authority/dashboard; router with role redirects (student → /student/dashboard, authority/admin → /authority/dashboard).

CONSTRAINTS
Use only the libraries already installed. Components must be reusable and prop-driven; no API calls inside ui components. Sidebar items per role exactly as in UI_UX.md. Every async view has loading + error states.

TESTS
Manual: wrong password shows error toast; student URL-hacking to /authority/* redirects; refresh keeps session; 401 clears session. Add Vitest + React Testing Library smoke tests for ProtectedRoute and StatusBadge.

VERIFY
Both demo buttons log in and show role-specific shells on desktop and mobile widths.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P8 prompt — Student portal

```
PHASE P8 — Student portal UI

OBJECTIVE
Deliver the full student experience: report, de-duplicate, and track.

ALREADY EXISTS
P0–P7: complete backend, client shell, auth, UI components.

READ FIRST
docs/UI_UX.md, docs/DUPLICATE_DETECTION.md (section 9.10), docs/API_DOCUMENTATION.md (5.3).

CREATE / MODIFY (client/src)
- api/issues.js, api/notifications.js, hooks/useDebounce.js, hooks/useNotifications.js (poll every 20s).
- pages/student/Dashboard.jsx: stat cards (Open / In progress / Resolved), recent issues, prominent "Report an issue" CTA.
- pages/student/ReportIssue.jsx: single-page guided form — LocationPicker (building → floor → room from /meta), description textarea with counter, category select with auto-suggest chip (debounced /suggest-category), PhotoUploader (max 3, preview, remove, client-side type/size check), DuplicateSuggestionCard (debounced check-duplicates after category+location+description≥10 chars; cancel stale requests; PROBABLE = prominent, RELATED = soft; buttons "Yes, same problem — add my report" / "No, this is different"), submit with loading state, success screen showing issue code, priority pill and outcome message ("Linked to CF-0042 — 3 students affected" or "New issue created").
- pages/student/MyIssues.jsx: filter tabs, IssueCard list, pagination.
- pages/student/IssueDetail.jsx: header (code, title, status, priority), MergedBanner when reportCount>1, StatusStepper, Timeline (student-visible entries only), photos with lightbox, authority remarks, optional Confirm/Reopen when RESOLVED.
- components/ui or issues: NotificationBell dropdown with unread badge and mark-all-read.

CONSTRAINTS
Mobile-first layout. Handle every state: loading skeletons, empty states, API errors with retry. No business logic duplicated from the server (the server decides priority and duplicates).

TESTS
Manual E2E: report with photo; report same issue as second student and link; reject suggestion and create new; verify notification appears after the authority changes status (use API for now); 375px viewport check. Add a Vitest test for DuplicateSuggestionCard rendering both bands.

VERIFY
Walk the student half of the demo script in docs/DEMO_FLOW.md without console errors.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P9 prompt — Authority portal

```
PHASE P9 — Authority portal UI

OBJECTIVE
Build the authority control center: dashboard, issue list, and issue workflow screen.

ALREADY EXISTS
P0–P8: backend, shell, UI components, student portal.

READ FIRST
docs/UI_UX.md, docs/API_DOCUMENTATION.md (5.4, 5.5), docs/PRIORITY_ENGINE.md, docs/DUPLICATE_DETECTION.md (9.10).

CREATE / MODIFY (client/src)
- api/authority.js, api/analytics.js.
- pages/authority/Dashboard.jsx: 6 StatCards (Total, Open, In progress, Resolved, Critical, Avg resolution), PriorityQueue (top 5 by priority score with code, title, location, priority pill, ×reports badge, age, quick "Open" action), and placeholders for charts (charts are completed in P10).
- pages/authority/Issues.jsx: filter bar (status, priority, category, building, department), debounced search, sort dropdown, table with priority color bar, StatusBadge, reports badge (×N), age, assigned department; pagination; clear-filters; mobile card layout; URL query-string sync for filters.
- pages/authority/IssueDetail.jsx: summary + photo gallery; PriorityBreakdown (stacked bar/list of safety, affected, location, category, age with plain-language "why HIGH"); GroupedReports panel (each report: reporter, time, photo, similarity chip); SimilarIssues panel with Merge (ConfirmDialog); ActionPanel (assign department with suggested department preselected + staff select, status select limited to allowed next transitions, priority override with required reason, remark with "visible to student" toggle); Timeline; optimistic UI not required — refetch after each action and toast.
- components/issues: IssueTable, PriorityBreakdown, GroupedReports, SimilarIssues, ActionPanel, Timeline (reuse from P8 if present).

CONSTRAINTS
Only offer valid next statuses (mirror ALLOWED_TRANSITIONS from /meta or a client constant, but the server stays authoritative and its errors must be shown). Disable action buttons while submitting. Do not modify the student pages except to import shared components.

TESTS
Manual: assign → status → remark → resolve; the student view reflects each change and receives notifications; merge two issues; filters/sort/search; student account cannot open /authority routes. Vitest: ActionPanel only lists allowed transitions.

VERIFY
Walk demo steps 5–14 in docs/DEMO_FLOW.md end to end.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P10 prompt — Analytics UI & polish

```
PHASE P10 — Analytics UI and visual polish

OBJECTIVE
Complete charts/insights and polish the product so it looks like a real SaaS.

ALREADY EXISTS
P0–P9: full working app.

READ FIRST
docs/UI_UX.md (charts, tokens, responsive rules), docs/API_DOCUMENTATION.md (5.5).

CREATE / MODIFY
- components/charts: TrendChart (created vs resolved lines), CategoryDonut, HotspotBar (horizontal), BuildingBar; consistent palette from tokens; tooltips; ResponsiveContainer.
- Wire into authority/Dashboard.jsx (trend + category donut + aging list + hotspot list) and pages/authority/Analytics.jsx (range selector 7/30/90 days, all charts, aging table with link to issue, avg resolution stat, recurring-locations table).
- Polish: animated stat counters, skeletons everywhere, EmptyState/ErrorState consistency, hover/focus states, favicon + page titles, subtle page transitions, 404 and 403 pages, consistent spacing, dark sidebar active state, sticky table headers, print-friendly nothing needed.
- Responsive pass at 375 / 768 / 1280 px.

CONSTRAINTS
No new heavy libraries (Recharts only). Do not change API contracts. Do not refactor unrelated logic.

TESTS
Manual: dashboards with empty DB and with seeded DB; each chart tooltip; 375px student pages; keyboard focus order on forms; no console errors/warnings.

VERIFY
Take screenshots of: student report with duplicate card, authority dashboard, issue detail, analytics — save under docs/screenshots/.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P11 prompt — Seed data, tests, demo hardening

```
PHASE P11 — Realistic seed data, test completion, demo hardening

OBJECTIVE
Make the dashboards look alive, make the demo repeatable, and finish the test suites.

ALREADY EXISTS
P0–P10: full app.

READ FIRST
docs/DEMO_FLOW.md (Phase 17 data and Phase 18 script), docs/TESTING.md.

CREATE / MODIFY
- server/seed/data/*: implement the Phase 17 dataset exactly (users, departments, locations, ~14 issues with reports, timelines, notifications). Use RELATIVE dates (daysAgo helper) so charts always look recent; compute priority with priority.service; set resolvedAt for resolved issues so average resolution time is meaningful (~18–30 hours).
- DO NOT seed the demo scenario issue ("Ceiling light not working", CS Block · Floor 2 · Room 204) — it is created live in the demo. DO seed a neighboring issue in Room 207 so related/recurrence behavior can be shown.
- npm scripts: `seed` (additive/idempotent), `seed:reset` (drop issues/reports/notifications/counters then reseed; refuse to run if NODE_ENV=production unless --force).
- Complete tests so every row of docs/TESTING.md matrices is covered: unit (priority, duplicate, transitions, text normalize), API (auth, student issues, link flow, authority actions, merge, analytics, role matrix). Add a script `npm run test:ci`.
- docs/TESTING.md: add a "Results log" with date and pass counts.

CONSTRAINTS
Don't change business logic to make tests pass unless a genuine bug is found — report such bugs explicitly.

VERIFY
`npm run seed:reset` < 10 s; dashboard shows meaningful charts; run the whole demo script three times with reset in between.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

## P12 prompt — Deployment

```
PHASE P12 — Deployment and final documentation

OBJECTIVE
Deploy the MVP (Atlas + Render + Vercel/Netlify) and finalize README/DEPLOYMENT docs.

ALREADY EXISTS
P0–P11: complete, tested app with seed/reset scripts.

READ FIRST
docs/DEPLOYMENT.md (stub), docs/ARCHITECTURE.md (env vars), README.md.

CREATE / MODIFY
- server: production start script, `trust proxy` setting, CORS locked to CLIENT_URL, production error handler (no stack traces), health route used by uptime ping, STORAGE_DRIVER=cloudinary in prod, DEMO_MODE=true for the demo deployment, render.yaml (optional).
- client: vercel.json (or netlify _redirects) with SPA rewrite `/* → /index.html`; VITE_API_URL documented.
- docs/DEPLOYMENT.md: step-by-step Atlas (M0 cluster, DB user, network access), Cloudinary (free account, keys), Render web service (root `server`, build `npm install`, start `npm start`, env vars), Vercel project (root `client`, build `npm run build`, env), post-deploy checklist, troubleshooting (CORS, cold start, 401 loops, image upload failures), how to run seed:reset against production safely.
- README.md: final pitch, screenshots from docs/screenshots, live URLs placeholder, demo accounts, local setup, tech stack, "how duplicate detection and priority work" summary, team section.

CONSTRAINTS
No secrets committed. Do not change app behavior except what deployment requires.

VERIFY
Live frontend can log in with both demo accounts, create an issue with a photo, link a duplicate, assign, resolve, and show analytics. Document the live URLs and the exact reset command.

STANDING BLOCK
Read AGENT_RULES.md and the docs named above before coding. Extend, never rewrite; don't touch files outside this phase's scope unless required (and say why). Validate input with zod, use the standard error envelope, no secrets in code. Finish with a REPORT: files created/modified, commands to run and verify, test results, deviations from docs, open risks/TODOs, and which docs you updated.
```

---

# PHASE 15 — ANTIGRAVITY DEVELOPMENT RULES

Paste into Antigravity's project instructions and save as `AGENT_RULES.md` in the repo root.

```
CAMPUSFIX — PERMANENT DEVELOPMENT RULES

CONTEXT
CampusFix is a hackathon MVP: a campus issue-management platform (React+Vite+Tailwind client, Node+Express server, MongoDB Atlas, JWT). Working reliably beats being clever. The product, schema, API, UI, duplicate-detection and priority specs live in /docs and are the source of truth.

BEFORE CODING
1. Read AGENT_RULES.md and every doc in /docs relevant to the phase (always DEVELOPMENT_PLAN.md, ARCHITECTURE.md, and the doc for the area you touch).
2. Inspect the existing code before changing it. Never blindly overwrite files; make targeted edits and preserve working behavior.
3. If the task conflicts with the docs, stop and report the conflict instead of silently deviating.

ARCHITECTURE
4. Keep client/ and server/ strictly separate. The client talks to the server only via the REST API.
5. Server layering: routes → controllers (thin) → services (business logic) → models. No business logic in routes/controllers.
6. priority.service and duplicate.service must stay PURE (no DB access) and use constants from one constants file.
7. Follow REST conventions and the API contract in docs/API_DOCUMENTATION.md. Use the standard envelope {success,data} / {success:false,error:{code,message,details}}.
8. Frontend: reusable, prop-driven components; pages compose components; API calls live in src/api/; every async view has loading, empty and error states.

QUALITY & SECURITY
9. Validate all input (zod on the server; basic checks on the client). Never trust client-supplied role, status, priority, reporter or scores.
10. Enforce authorization on the server for every protected route and ownership rule; frontend guards are only UX.
11. Never expose or commit secrets. Use environment variables and keep .env.example current. Never return passwordHash.
12. Handle errors properly: no unhandled promise rejections, no stack traces to clients in production, helpful messages for users.
13. Use helmet, CORS limited to CLIENT_URL, rate limiting, upload type/size limits.

PROCESS
14. Work incrementally: only implement the current phase. Don't rewrite the project, rename things, or refactor unrelated code.
15. Do not add libraries unless truly required; justify any new dependency in your report.
16. Don't over-engineer: no microservices, queues, websockets, caching layers or abstractions not required by the docs.
17. Test before declaring done: run the server/client, run the automated tests, and manually verify the phase's checklist. Fix failures; don't hide them.
18. Explain important decisions briefly in code comments or your report. Keep code readable and consistent (ES modules, async/await, camelCase, meaningful names).
19. Update documentation whenever behavior, schema, API or architecture changes (and DECISIONS.md for notable choices).
20. Optimize for demo reliability: seed data must be repeatable, the main demo flow must never break, and UI must degrade gracefully.

EVERY RESPONSE ENDS WITH A REPORT
Files created/modified · how to run and verify · test results · deviations from docs · risks/TODOs · docs updated.
```

---

# PHASE 16 — TESTING STRATEGY

| Layer | Tooling | Strategy |
| --- | --- | --- |
| Unit (server) | Jest | Pure functions: priority, duplicate similarity, normalization, transition table. Fast, exhaustive tables |
| API | Jest + Supertest + mongodb-memory-server | Each endpoint: happy path, validation error, auth/role error, edge case |
| Integration | Same harness | Flow tests: create → link → assign → in-progress → resolve → analytics counts |
| Frontend | Vitest + React Testing Library | Smoke tests only: ProtectedRoute, StatusBadge/PriorityPill, DuplicateSuggestionCard, ActionPanel transitions |
| Manual | Checklist below | Run on desktop + 375px mobile; before every demo rehearsal |
| Authorization | Table-driven Supertest | One test per cell of the Phase 6 matrix |

## 16.1 Test matrix (concise)

| Area | Case | Expected |
| --- | --- | --- |
| Auth | Wrong password | 401, generic message |
| Auth | Demo login with DEMO_MODE=false | 403 |
| Auth | Expired/invalid token | 401 |
| AuthZ | Student → `/authority/issues` | 403 |
| AuthZ | Student A → `/issues/:id` of student B's issue | 403 |
| AuthZ | Student sees internal remark | Never |
| Upload | PDF / 6 MB / 4 files | 415 / 413 / 400 |
| Create | Description \< 10 chars | 400 |
| Create | Invalid location id | 400/404 |
| Link | Same student links twice | 409 |
| Link | Target CLOSED/REJECTED | 409 |
| Workflow | REPORTED → RESOLVED | 409 INVALID_TRANSITION |
| Workflow | Resolve without note | 400 |
| Workflow | IN_PROGRESS without department | 409 |
| Workflow | Override priority without reason | 400 |
| Merge | Merge issue into itself | 400 |
| Merge | Merge moves reports; source hidden | ✔ |
| Notifications | Status change | Every reporter gets one |
| Analytics | Empty DB | Zeros, no crash |
| Analytics | Merged issues | Not counted |

## 16.2 Duplicate detection test cases

| # | Setup | Expected score | Band |
| --- | --- | --- | --- |
| D1 | Same cat/room; "Ceiling light not working" vs "Broken light in classroom" | 0.80 | PROBABLE |
| D2 | Same cat/room; "Ceiling fan not working" vs "Fan making loud noise" | 0.68 | RELATED |
| D3 | Same cat; same floor, different room; identical text | 0.86 | PROBABLE |
| D4 | Same cat; same building, different floor; identical text | ≤0.74 (cap) | RELATED |
| D5 | Different category, same room | ≤0.49 | NONE |
| D6 | Same cat/room; zero keyword overlap | ≤0.49 | NONE |
| D7 | Different building | ≤0.49 | NONE |
| D8 | Matching issue is RESOLVED 5 days ago | New issue + `recurrenceOf` | — |
| D9 | Matching issue is merged/REJECTED | Not a candidate | — |
| D10 | Normalization: "tube light", "bulb", "tubelight" | all → `light` | — |

## 16.3 Priority test cases

| # | Input | Score | Level |
| --- | --- | --- | --- |
| R1 | Electrical, crit 3, 1 report, no keywords, day 0 | 22 | LOW |
| R2 | Same, 3 reports | 36 | MEDIUM |
| R3 | Same, 4 reports, 3 days | 52 | HIGH |
| R4 | "sparking socket", Electrical, crit 4, 1 report | 60 | HIGH |
| R5 | Same, 2 reports | 67 | CRITICAL |
| R6 | "water leakage", Plumbing, crit 4, 3 reports, 2 days | 62 | HIGH |
| R7 | Wi-Fi, crit 3, 5 reports, 1 day | 47 | HIGH |
| R8 | Furniture, crit 3, 1 report | 16 | LOW |
| R9 | Boundary scores 24/25, 44/45, 64/65 | LOW/MED, MED/HIGH, HIGH/CRIT | — |
| R10 | Age 10 days | age points capped at 15 | — |
| R11 | Resolved issue | age points 0 | — |
| R12 | Manual override HIGH → new report arrives | level stays HIGH, score updates | — |

## 16.4 Manual demo checklist (before every rehearsal)

- [ ] `seed:reset` done, dashboards populated
- [ ] Student demo login → report form loads locations
- [ ] Photo upload works (prod Cloudinary)
- [ ] Duplicate card appears with score text
- [ ] Authority sees new issue within one refresh
- [ ] Assign, status change → student bell updates (within 20 s or manual refresh)
- [ ] Analytics numbers change after resolve
- [ ] Mobile viewport OK; no console errors

---

# PHASE 17 — DEMO DATA

Password for all demo users: `Demo@123`. Email domain `@campusfix.demo`. Seed script must use **relative dates**.

## 17.1 Users

| Name | Email | Role | Detail |
| --- | --- | --- | --- |
| Aarav Sharma | aarav@ | STUDENT | CS24B012, Boys Hostel A |
| Priya Das | priya@ | STUDENT | CS24B027, Girls Hostel |
| Rohan Singh | rohan@ | STUDENT | CE24B015, Boys Hostel A |
| Ananya Gogoi | ananya@ | STUDENT | EE24B008, Girls Hostel |
| Kabir Yadav | kabir@ | STUDENT | ME24B041, Boys Hostel B |
| Meera Nair | meera@ | STUDENT | CS23B019, Girls Hostel |
| Dr. R. K. Bora | estate@ | AUTHORITY | Estate Officer (demo authority) |
| Sunita Devi | maintenance@ | AUTHORITY | Maintenance Supervisor |
| Campus Admin | admin@ | ADMIN | — |

## 17.2 Departments (category → department)

| Department | Code | Categories | Staff |
| --- | --- | --- | --- |
| Electrical Maintenance | ELEC | ELECTRICAL | Ramesh Kumar, Biren Saikia |
| Plumbing & Water | PLUMB | PLUMBING | Dilip Das |
| IT & Network | IT | NETWORK, EQUIPMENT | Nitin Rao, Pooja Hazarika |
| Housekeeping & Sanitation | HK | SANITATION | Lakshmi Devi |
| Civil & Furniture | CIVIL | STRUCTURAL, FURNITURE | Mohan Lal |
| Estate Office | ESTATE | OTHER (fallback) | — |

## 17.3 Locations (crit = criticality 1–5)

| Building | Floor | Area | Zone | Crit |
| --- | --- | --- | --- | --- |
| CS Block | Floor 2 | Room 204 | CLASSROOM | 3 |
| CS Block | Floor 2 | Room 207 | CLASSROOM | 3 |
| CS Block | Floor 1 | Computer Lab 1 | LAB | 4 |
| Civil Block | Floor 1 | Room 101 | CLASSROOM | 3 |
| Main Library | Floor 1 | Reading Hall | LIBRARY | 4 |
| Main Library | Ground | Entrance Lobby | COMMON | 2 |
| Boys Hostel A | Floor 1 | Room 112 | HOSTEL | 4 |
| Boys Hostel A | Floor 2 | Washroom | HOSTEL | 4 |
| Girls Hostel | Floor 1 | Common Room | HOSTEL | 4 |
| Girls Hostel | Ground | Mess Hall | MESS | 5 |
| Admin Block | Ground | Seminar Hall | COMMON | 3 |
| Sports Complex | Ground | Gym | SPORTS | 2 |
| Central Canteen | Ground | Dining Area | COMMON | 3 |
| Academic Area | Campus-wide | Wi-Fi Zone A | COMMON | 3 |

## 17.4 Issues (≈14, with ages relative to "today")

| Issue | Category · Location | Reports | Status | Age | Resulting priority |
| --- | --- | --- | --- | --- | --- |
| Fan making loud noise | ELECTRICAL · CS Block Room 207 | 1 | REPORTED | 0 d | LOW (seeds a *related* demo case) |
| Wi-Fi not connecting | NETWORK · Wi-Fi Zone A | 5 | IN_PROGRESS (IT, Nitin Rao) | 1 d | HIGH |
| Water leakage from ceiling | PLUMBING · Library Reading Hall | 3 | ASSIGNED (PLUMB) | 2 d | HIGH |
| Sparking switchboard | ELECTRICAL · Boys Hostel A Room 112 | 2 | IN_PROGRESS (ELEC) | 0 d | CRITICAL |
| Washroom not cleaned, foul smell | SANITATION · Boys Hostel A Washroom | 4 | REPORTED | 4 d | CRITICAL (75) |
| Broken bench | FURNITURE · Central Canteen | 1 | ASSIGNED | 3 d | MEDIUM (25) |
| Projector not turning on | EQUIPMENT · Civil Block Room 101 | 2 | IN_PROGRESS | 2 d | MEDIUM |
| Tube light not working | ELECTRICAL · Computer Lab 1 | 2 | RESOLVED (≈20 h) | 9 d | — |
| Tap leaking continuously | PLUMBING · Girls Hostel Common Room | 3 | RESOLVED (≈26 h) | 12 d | — |
| Wi-Fi dead zone | NETWORK · Girls Hostel Mess | 2 | RESOLVED (≈30 h) | 15 d | — |
| Ceiling light flickering | ELECTRICAL · Admin Block Seminar Hall | 1 | RESOLVED (≈18 h) | 22 d | — (keeps the live Room 204 demo clean) |
| Mess food hygiene complaint | SANITATION · Girls Hostel Mess | 2 | CLOSED | 18 d | — |
| Broken window glass | STRUCTURAL · Admin Seminar Hall | 1 | REJECTED (out of scope: contractor warranty) | 6 d | — |
| Seat damaged | FURNITURE · Library Reading Hall | 1 | RESOLVED | 7 d | — |
| Gym treadmill not working | EQUIPMENT · Sports Gym | 1 | REPORTED | 8 d | MEDIUM (shows in "aging") |

Also seed: a spread of `createdAt` across the last 30 days (for the trend chart), 2 issues each in CS Block and Hostel A to make them "hotspots", and a few notifications for Aarav and Priya. **Do NOT seed** "Ceiling light not working — CS Block Room 204": it is created live in the demo.

---

# PHASE 18 — HACKATHON DEMO SCRIPT (≈4 min 30 s)

**Before you start**: run `seed:reset`, open two browser windows (student: normal; authority: incognito) side-by-side, ping the Render URL to wake it, keep a photo of a ceiling light on the desktop.

| Time | Screen | Say | Do |
| --- | --- | --- | --- |
| 0:00–0:25 | Slide / WhatsApp screenshot | "Imagine a student finds a broken light. Today it's a WhatsApp message among 300 others. No owner, no status, five students report it five times." | Show slide of chaos |
| 0:25–0:45 | `/login` | "CampusFix turns that into one tracked issue." | Click **Demo Student** (Aarav) |
| 0:45–1:25 | `/student/report` | "30 seconds to report." | Pick CS Block → Floor 2 → Room 204; type "Ceiling light not working"; point at the auto-suggested **Electrical** chip; upload photo; submit |
| 1:25–1:45 | Success screen | "System categorized it, calculated priority — LOW for now — and routed it to Electrical Maintenance." | Point at code CF-00xx + priority pill |
| 1:45–2:25 | Authority window `/authority/dashboard` | "The admin sees it immediately in the priority queue." | Refresh; show new issue; mention stat cards |
| 2:25–3:05 | Student window (switch to Priya) | "Now a second student sees the same light." | Report "Broken light in classroom" at Room 204 → **duplicate card appears, 80% match** → click "Yes, same problem". Optional third student: priority rises LOW→MEDIUM |
| 3:05–3:45 | Authority issue detail | "One underlying issue, grouped reports, priority explained: affected students increased the score." | Show grouped reports + priority breakdown; assign **Electrical Maintenance / Ramesh Kumar**; set **IN_PROGRESS**; add remark "Electrician visiting at 3 PM" |
| 3:45–4:00 | Student window | "Students track progress without chasing anyone." | Show bell notification + timeline; open issue detail |
| 4:00–4:15 | Authority | Mark **RESOLVED** with note | Student sees RESOLVED |
| 4:15–4:30 | `/authority/analytics` | "And the campus finally gets insight: hotspots, recurring problems, aging issues, average resolution time." | Show hotspot chart + aging list; close with the one-line value prop |

**Fallbacks**: if live upload fails → skip the photo (optional field); if network fails → local build with `STORAGE_DRIVER=local`; keep a 90-second screen recording as backup.

---

# PHASE 19 — JUDGING STRATEGY

| Criterion | How CampusFix scores | Cheap boosters |
| --- | --- | --- |
| **Innovation** | Issue-vs-report model; live explainable duplicate matching; transparent priority that escalates as students join | Show the score breakdown on screen ("why HIGH?") |
| **Technical implementation** | Layered backend, pure testable engines, validated state machine, JWT RBAC, tests, deployed | Show test run count + `docs/DECISIONS.md` |
| **Problem relevance** | Every item in the problem statement maps to a feature (Phase 0.3 table) | Put the mapping table in the README and slides |
| **User experience** | 60-second reporting, mobile-first, clear tracking, SaaS-grade authority UI | Mobile screenshot; empty/loading states polished |
| **Scalability** | Stateless API, indexed queries, cloud storage, can add multi-campus via tenant id, queue/cron/email later | One slide "Architecture → Where it scales next" |
| **Impact** | Fewer lost complaints, faster resolution, data-driven maintenance planning | Quote avg resolution time and hotspot insight; propose pilot on your own campus |
| **Demo quality** | Single story, two windows, 4:30 runtime, backup plan | Rehearse 3×; reset script |

**High perceived value, low effort**: "Why HIGH?" breakdown; similarity score chip on grouped reports; priority escalation live; hotspot list; timeline with relative times; demo login buttons; bell notification; QR-prefilled location (optional).

**Likely judge questions**: *"Why not AI?"* → deterministic, explainable, no external dependency, designed so an embedding model can replace the keyword score later. *"What if duplicate detection is wrong?"* → human confirmation + authority merge. *"How do you stop abuse?"* → auth, rate limits, one report per student per issue, rejected status.

---

# PHASE 20 — OPTIONAL WOW FEATURES

All optional. Build **only after P11 is stable.**

| # | Feature | Impact | Effort | Demo value | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Recurring-issue flag ("fixed 12 days ago, broken again") | High | Low (already in schema) | High | Shows maintenance quality problems |
| 2 | Building heat tiles (colored grid by open-issue count) | Med | Low | High | Pure CSS grid, no map library |
| 3 | QR code per location → `/student/report?location=ID` | High | Low–Med | High | Print a QR for the demo room and scan it live |
| 4 | SLA timers (target hours per priority; "overdue" badge) | Med | Low | Med | `now − createdAt` vs constant |
| 5 | "Me too" button on issue cards (one-tap link) | Med | Low | High | Reuses link endpoint |
| 6 | Email notifications (Nodemailer + Gmail app password / Resend free) | Med | Med | Med | Needs secrets + deliverability |
| 7 | Smart category suggestion v2 (more keywords + scoring) | Low | Low | Med | Already basic in MVP |
| 8 | Public "campus health" page (anonymized open/resolved stats) | Med | Low | Med | Transparency story |
| 9 | CSV export of issues | Low | Low | Low | For administrators |
| 10 | LLM-assisted categorization with automatic fallback to rules | Med | Med | Med | **Optional only**; app must work without it |

Recommended order if time: **3 → 1 → 5 → 2 → 4**. Skip image classification.

---

# PHASE 21 — FINAL IMPLEMENTATION ORDER

1. Create GitHub repo; add `docs/BLUEPRINT.md` and `AGENT_RULES.md`; paste rules into Antigravity.
2. Create MongoDB Atlas M0 cluster, DB user, IP allow-list; create Cloudinary free account (can postpone).
3. Run **P0** (docs split + scaffolding) → commit.
4. Run **P1** (backend foundation + models + seed skeleton) → test → commit.
5. Run **P2** (auth + RBAC + /meta) → test → commit.
6. Run **P3** (priority engine + issue creation + upload) → test → commit.
7. Run **P4** (duplicate detection + linking) → test → commit. *This is your differentiator — verify the 0.80 example.*
8. Run **P5** (authority workflow API + notifications + merge) → test full flow in Postman → commit.
9. Run **P6** (analytics API) → commit.
10. Run **P7** (frontend foundation + login) → commit.
11. Run **P8** (student portal) → manual E2E → commit.
12. Run **P9** (authority portal) → manual E2E → commit.
13. Run **P10** (charts + polish + responsive) → screenshots → commit.
14. Run **P11** (seed data, tests, demo hardening) → rehearse demo once.
15. Run **P12** (deploy) → test live demo with both accounts.
16. Optional wow features (QR → recurring → "me too").
17. Final rehearsals (3×), record a backup video, finish README + slides, freeze code.

**Time-boxing for a \~24–36 h hackathon**: P0–P2 ≈ 15%, P3–P5 ≈ 25%, P6 ≈ 5%, P7–P9 ≈ 30%, P10–P11 ≈ 12%, P12 ≈ 5%, demo prep ≈ 8%. If you fall behind: cut P10 polish (not P4/P5), skip registration, notifications polling, `CLOSED` UI, and wow features.

**Daily rule**: after each phase, commit, deploy backend early if possible (don't leave deployment to the last hour).