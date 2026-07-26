# Authoring yolojsx applications

## Component contract

- Create a readable `.jsx` module with one default-exported React component.
- Use relative imports for local modules and assets.
- Assume yolojsx supplies React, React DOM, Ant Design, Tailwind CSS, React
  Icons, and PrismJS. Other bare imports must exist in the input project's
  `node_modules`.
- Use browser APIs directly for small tools when they are sufficient.

```jsx
import { Button, Card, Typography } from "antd";
import { LuDownload } from "react-icons/lu";

export default function Report() {
  return (
    <main className="min-h-screen p-6 sm:p-10">
      <Card className="mx-auto max-w-4xl">
        <Typography.Title>Release readiness</Typography.Title>
        <Typography.Paragraph type="secondary">
          Review the findings, then export the approved result.
        </Typography.Paragraph>
        <Button type="primary" icon={<LuDownload aria-hidden="true" />}>
          Export result
        </Button>
      </Card>
    </main>
  );
}
```

## Stack responsibilities

- **React:** component structure, derived values, and only the state needed for
  useful interaction.
- **Ant Design:** controls, forms, cards, tables, navigation, feedback, and other
  interactive UI. Prefer ordinary semantic props such as `type="primary"`,
  `danger`, `disabled`, and `Typography.Text type="secondary"`.
- **Tailwind CSS v4:** responsive layout, spacing, sizing, and small utility
  adjustments. Prefer semantic yolojsx utilities over hard-coded theme colors.
- **yolojsx themes:** global typography, surfaces, focus, selection, native
  elements, Ant Design tokens, and visual direction.
- **React Icons:** recognizable supporting symbols. Import named icons from one
  specific collection subpath such as `react-icons/lu`; do not import an entire
  catalog or mix several icon families without a reason.
- **PrismJS:** syntax highlighting for code that benefits from language-aware
  tokens. Import only the language definitions used by the artifact. Keep plain
  `<pre><code>` for short or language-neutral snippets.

## Theme usage

Let native elements inherit the theme and let Ant Design style its own
components. Prefer these semantic Tailwind utilities when explicit styling is
needed:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-code`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Structure: `border-border`, `ring-ring`, `shadow-card`
- Status: `text-success`, `text-warning`, `text-danger`, `text-info` and their
  matching `*-background` utilities
- Shape and type: `rounded-sm`, `rounded-md`, `rounded-lg`, `font-sans`,
  `font-mono`

Avoid hard-coded page-wide palettes, `.ant-*` selector overrides, and large
custom stylesheets. Use `--css` only for deliberate application-wide rules the
theme and utilities cannot express cleanly.

## Information design

Optimize all three layers:

1. **Legibility:** use body text around 16–20px, WCAG AA contrast (4.5:1 for
   normal text and 3:1 for large text), visible focus, and comfortable foreground
   and background colors.
2. **Readability:** keep prose measures around 45–75 characters, line height
   around 1.4–1.6, clear paragraph spacing, and fluid responsive layouts.
3. **Comprehension:** lead with the conclusion or status, use semantic landmarks
   and ordered headings, group related information, and expose the next action.

Support scanning with short paragraphs, descriptive headings, lists, summary
cards, callouts, and progressive disclosure. Do not turn every sentence into a
card. Use tables for exact comparisons, not general page layout.

## Interaction

- Add interaction only when it helps readers filter, compare, inspect, copy,
  calculate, validate, or complete a task.
- Show defaults and initial content; do not open to an empty dashboard.
- Cover loading, empty, error, disabled, and success states when the workflow can
  actually reach them.
- Keep controls keyboard accessible and label inputs explicitly.
- Make wide tables, code blocks, and dense toolbars usable on small screens.
- Prefer native browser capabilities for clipboard, download, date, color, and
  file inputs before adding code or dependencies.
- Target modern browsers supported by yolojsx. Do not add legacy API fallbacks or
  polyfills unless the user or target environment requires them.
- Handle rejected browser API promises with concise visible feedback when the
  action is part of the requested workflow.

## Content and token efficiency

- Put the user's real content and conclusions ahead of decorative chrome.
- Use data arrays plus mapping for repeated facts, options, rows, or sections.
- Keep small one-off layouts inline instead of creating abstraction layers.
- Avoid invented metrics, testimonials, links, or actions that imply unavailable
  behavior.
- When required source data is missing, ask for it or label placeholder data
  clearly; never present invented details as real results.
- Use remote media when it materially improves the artifact. Preserve essential
  meaning in nearby text or `alt`; do not generate dozens of speculative
  fallbacks.
