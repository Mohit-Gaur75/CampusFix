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
