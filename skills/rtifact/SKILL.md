---
name: rtifact
description: Create, revise, build, or diagnose portable, interactive HTML artifacts with the Rtifact CLI and its supplied React, Ant Design, Tailwind CSS, React Icons, and PrismJS stack. Use when a user wants a shareable report, guide, demo, comparison, dashboard, or small browser tool; mentions Rtifact or an Rtifact theme/output mode; asks for JSX compatible with Rtifact; or wants to turn content or data into one portable HTML file, an offline artifact, or a deployable static asset directory.
---

# Rtifact

Rtifact turns agent-authored JSX into portable, interactive HTML artifacts.
Start from the finished artifact's audience and purpose, not from frontend
scaffolding. Optimize the rendered artifact; JSX is its compact source format.

## Product priorities

Apply these in order:

1. Produce a correct, reliable, portable artifact.
2. Keep the workflow predictable for AI agents.
3. Make rendered information legible, scannable, and understandable.
4. Preserve useful interaction, responsive behavior, and accessibility.
5. Use Rtifact themes and the supplied stack for consistent visual quality.
6. Keep JSX compact, reusable, and token-efficient.
7. Reduce artifact size when the higher priorities still hold.

## Workflow

1. Identify the audience, the information they need, and the action the artifact
   should enable. Treat reports, internal guides, demos, design comparisons, and
   small developer tools as common patterns, not fixed templates.
2. Read [references/authoring.md](references/authoring.md) before creating or
   revising JSX.
3. Read the closest complete example from the routing guide below. Read a second
   only when the requested artifact combines two patterns.
4. Prefer one self-contained `.jsx` or `.tsx` entry with a default-exported component.
   Split local components only when repetition or complexity makes the entry
   harder to understand.
5. Use static markup for static content. Add React state only for interaction
   that improves exploration, comparison, validation, or task completion.
6. Let the selected Rtifact theme handle global styling. When consuming an
   existing custom theme, read [references/use-custom-theme.md](references/use-custom-theme.md).
   When creating or revising one, use the `rtifact-create-theme` skill; read the
   reference only when path, import, or runtime boundaries are relevant.
   Use Ant Design for interactive components and Tailwind utilities for layout and
   focused adjustments.
7. When the user wants a built artifact, needs an output-mode decision, or has a
   CLI/build failure, read [references/cli.md](references/cli.md), run the
   smallest relevant build, and fix actionable diagnostics.
8. Check the rendered information structure and interactive states. At minimum,
   verify the JSX builds successfully; do not claim visual correctness from a
   source-only review.

## Example routing

Reuse the selected example's composition, interaction, accessibility, and
supplied-stack patterns. Replace its subject matter and data; do not clone its
branding or content.

- API reference, request explorer, copyable or highlighted code:
  [examples/APIDocs.jsx](examples/APIDocs.jsx)
- API test results, failure triage, or request and response evidence:
  [examples/APITestReport.jsx](examples/APITestReport.jsx)
- Operational dashboard, metrics, filters, charts, or status tables:
  [examples/Analytics.jsx](examples/Analytics.jsx)
- Code review findings, severity filters, or suggested diffs:
  [examples/CodeReviewReport.jsx](examples/CodeReviewReport.jsx)
- Long-form article, report, or highly readable narrative:
  [examples/Editorial.jsx](examples/Editorial.jsx)
- Product landing page, feature presentation, or interactive pricing:
  [examples/SaaS.jsx](examples/SaaS.jsx)
- Setup guide, procedural checklist, copyable commands, or troubleshooting:
  [examples/SetupGuide.jsx](examples/SetupGuide.jsx)
- Form, calculator, validation, derived totals, or breakdown table:
  [examples/TaxCalculator.jsx](examples/TaxCalculator.jsx)
- RFC, technical specification, requirements matrix, or implementation plan:
  [examples/Techspec.jsx](examples/Techspec.jsx)

The copied examples are complete runnable references. Their shared
[examples/favicon.svg](examples/favicon.svg) supports the metadata import.

## Guardrails

- Do not create Vite, Tailwind, HTML, or React project configuration. Rtifact
  supplies and isolates that environment.
- Do not add a router, state library, component framework, or custom design
  system for a single-artifact app.
- Do not import Rtifact theme CSS or add an application `ConfigProvider`;
  generated output already supplies the theme boundary.
- Do not use icons as the only accessible label. Mark decorative icons hidden
  from assistive technology and label icon-only controls.
- Treat JSX theme modules and imported CSS as trusted local code, but
  validate user-entered values and never expose secrets in a portable artifact.
- Allow remote fonts, images, and intentional API calls when useful. Add one
  meaningful fallback when a remote resource is essential; avoid fallback
  boilerplate for every enhancement.
- Do not force-overwrite an existing output unless the user authorized replacing
  that exact target.
