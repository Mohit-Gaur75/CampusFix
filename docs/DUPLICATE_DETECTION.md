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
