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
