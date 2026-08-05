---
name: rtifact
description: Use when you need to turn content, data, findings, or an existing JSX entry into a portable, self-contained file someone opens in a browser — including reports, dashboards, calculators, tech specs, setup guides, code review summaries, demos, comparisons, or small browser tools. Use this skill even if the user hasn't said "Rtifact" or "HTML", as long as the goal is a shareable readable artifact rather than a reusable codebase or full application. Also use when diagnosing Rtifact build failures, choosing an output mode, authoring JSX for the Rtifact stack, or applying a theme to an existing artifact. Do not use for HTML email templates, npm packages, scaffolded web app projects, or general static site generators.
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
2. For a new artifact or when uncertain about a stack behavior, read
   [references/authoring.md](references/authoring.md) before writing JSX.
   For a targeted revision, read only the section relevant to the change
   (e.g., just "PrismJS highlighting" or just "Interaction").
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
7. Run the smallest relevant build once the JSX is ready. Read
   [references/cli.md](references/cli.md) for output mode selection and option
   constraints. A successful build is the minimum quality gate — do not skip it
   and do not present the artifact as complete from a source-only review.
8. If a build fails, read [references/cli.md](references/cli.md) ("When a
   build fails" section) and fix the diagnostic there before trying any other
   workaround. Do not switch output modes to evade a build error.
9. Check the rendered information structure and interactive states. At minimum,
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
- Full Ant Design component catalog, theme stress-test, or verifying that all
  interactive components render correctly under a theme:
  [examples/AntD.jsx](examples/AntD.jsx)

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
- Do not read `node_modules` to understand Rtifact's behavior. All necessary
  information about the CLI, output modes, stack, and authoring conventions is
  documented in this skill's references. Reading Rtifact internals from
  `node_modules` will produce misleading results because the public surface is
  the only stable contract.
