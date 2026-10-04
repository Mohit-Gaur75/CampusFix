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
