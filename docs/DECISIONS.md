# DECISIONS

- **Issue vs Report**: A Report is a single student's submission. An Issue is the underlying problem. Many reports can link to one issue.
- **No TRIAGED status**: Issues start as REPORTED and are auto-triaged (category, priority, suggested department).
- **DUPLICATE is not an issue status**: Duplicate is a report-level link to an existing issue. Manual merges set `mergedInto`.
- **Deterministic dedupe and priority**: Using clear algorithmic scoring rules rather than AI to ensure explainability and predictability.
- **Cloudinary with local fallback**: Images upload to Cloudinary in prod, but can fall back to local disk in dev using STORAGE_DRIVER.
- **Single analytics endpoint**: One overview endpoint (`/analytics/overview`) powers the entire authority dashboard and analytics page.
