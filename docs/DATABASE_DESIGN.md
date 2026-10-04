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
