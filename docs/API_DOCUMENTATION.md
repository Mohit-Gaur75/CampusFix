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
