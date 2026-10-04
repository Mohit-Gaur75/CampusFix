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
