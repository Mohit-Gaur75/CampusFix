const fs = require('fs');
const path = require('path');

const blueprintPath = path.join(__dirname, 'docs', 'BLUEPRINT.md');
const docsDir = path.join(__dirname, 'docs');

const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');

// Helper to extract a phase by its number
function getPhase(content, phaseNumber) {
    const regex = new RegExp(`(# PHASE ${phaseNumber} [\\s\\S]*?)(?=\\n# PHASE |\\n# END|$)`);
    const match = content.match(regex);
    return match ? match[0].trim() : '';
}

const writeDoc = (filename, content) => {
    fs.writeFileSync(path.join(docsDir, filename), content.trim() + '\n');
    console.log(`Created ${filename}`);
};

writeDoc('PROJECT_OVERVIEW.md', getPhase(blueprintContent, 0));
writeDoc('REQUIREMENTS.md', getPhase(blueprintContent, 1));
writeDoc('ARCHITECTURE.md', getPhase(blueprintContent, 3) + '\n\n' + getPhase(blueprintContent, 12));
writeDoc('DATABASE_DESIGN.md', getPhase(blueprintContent, 4));
writeDoc('API_DOCUMENTATION.md', getPhase(blueprintContent, 5));
writeDoc('AUTHORIZATION.md', getPhase(blueprintContent, 6));
writeDoc('UI_UX.md', getPhase(blueprintContent, 7) + '\n\n' + getPhase(blueprintContent, 8));
writeDoc('DUPLICATE_DETECTION.md', getPhase(blueprintContent, 9));
writeDoc('PRIORITY_ENGINE.md', getPhase(blueprintContent, 10));

const phase13 = getPhase(blueprintContent, 13) || '# PHASE 13 — DEVELOPMENT PLAN\n';
writeDoc('DEVELOPMENT_PLAN.md', phase13 + '\n\n## Status log\n- [ ] Phase 0: Setup & Docs\n- [ ] Phase 1: Database & Models\n');

writeDoc('DEMO_FLOW.md', getPhase(blueprintContent, 17) + '\n\n' + getPhase(blueprintContent, 18));
writeDoc('TESTING.md', getPhase(blueprintContent, 16));

writeDoc('DEPLOYMENT.md', '# DEPLOYMENT\n\nStub for deployment instructions.\n');

const decisionsContent = `# DECISIONS

- **Issue vs Report**: A Report is a single student's submission. An Issue is the underlying problem. Many reports can link to one issue.
- **No TRIAGED status**: Issues start as REPORTED and are auto-triaged (category, priority, suggested department).
- **DUPLICATE is not an issue status**: Duplicate is a report-level link to an existing issue. Manual merges set \`mergedInto\`.
- **Deterministic dedupe and priority**: Using clear algorithmic scoring rules rather than AI to ensure explainability and predictability.
- **Cloudinary with local fallback**: Images upload to Cloudinary in prod, but can fall back to local disk in dev using STORAGE_DRIVER.
- **Single analytics endpoint**: One overview endpoint (\`/analytics/overview\`) powers the entire authority dashboard and analytics page.
`;
writeDoc('DECISIONS.md', decisionsContent);
