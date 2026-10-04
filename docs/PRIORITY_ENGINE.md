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
