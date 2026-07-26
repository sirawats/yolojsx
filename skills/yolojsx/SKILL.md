---
name: yolojsx
description: Create, revise, build, or diagnose compact JSX applications for the yolojsx CLI and its supplied React, Ant Design, Tailwind CSS, React Icons, and PrismJS stack. Use when a user wants a portable interactive HTML report, guide, demo, comparison, dashboard, or small browser tool; mentions yolojsx or a yolojsx theme/output mode; asks for JSX compatible with yolojsx; or wants to turn content or data into a self-contained HTML application or deployable static asset directory.
---

# yolojsx

Turn content and workflows into readable, interactive browser artifacts without
scaffolding a frontend project. Optimize for the rendered application; the JSX
is an agent-authored source format.

## Product priorities

Apply these in order:

1. Produce correct, reliable, portable output.
2. Keep the workflow predictable for AI agents.
3. Make rendered information legible, scannable, and understandable.
4. Preserve useful interaction, responsive behavior, and accessibility.
5. Use yolojsx themes and the supplied stack for consistent visual quality.
6. Keep JSX compact, reusable, and token-efficient.
7. Reduce artifact size when the higher priorities still hold.

## Workflow

1. Identify the audience, the information they need, and the action the artifact
   should enable. Treat reports, internal guides, demos, design comparisons, and
   small developer tools as common patterns, not fixed templates.
2. Read [references/authoring.md](references/authoring.md) before creating or
   revising JSX.
3. Prefer one self-contained `.jsx` entry with a default-exported component.
   Split local components only when repetition or complexity makes the entry
   harder to understand.
4. Use static markup for static content. Add React state only for interaction
   that improves exploration, comparison, validation, or task completion.
5. Let the selected yolojsx theme handle global styling. Use Ant Design for
   interactive components and Tailwind utilities for layout and focused
   adjustments.
6. When the user wants a built artifact, needs an output-mode decision, or has a
   CLI/build failure, read [references/cli.md](references/cli.md), run the
   smallest relevant build, and fix actionable diagnostics.
7. Check the rendered information structure and interactive states. At minimum,
   verify the JSX builds successfully; do not claim visual correctness from a
   source-only review.

## Guardrails

- Do not create Vite, Tailwind, HTML, or React project configuration. yolojsx
  supplies and isolates that environment.
- Do not add a router, state library, component framework, or custom design
  system for a single-artifact app.
- Do not import yolojsx theme CSS or add an application `ConfigProvider`;
  generated output already supplies the theme boundary.
- Do not use icons as the only accessible label. Mark decorative icons hidden
  from assistive technology and label icon-only controls.
- Treat JSX and custom CSS as trusted local code, but validate user-entered
  values and never expose secrets in a portable artifact.
- Allow remote fonts, images, and intentional API calls when useful. Add one
  meaningful fallback when a remote resource is essential; avoid fallback
  boilerplate for every enhancement.
- Do not force-overwrite an existing output unless the user authorized replacing
  that exact target.
