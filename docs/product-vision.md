# yolojsx Product Vision

## Mission

`yolojsx` turns primarily AI-authored JSX into portable, readable, interactive
React applications without asking the author to set up a frontend project.

The human-facing deliverable is the rendered application. JSX is a compact,
reusable source format that gives AI agents a consistent component model while
spending fewer tokens than repeatedly generating complete HTML, CSS, and
JavaScript documents.

Success means a person can ask an agent to turn content, data, or a small
workflow into an application, then open, upload, or send the result to a friend
or colleague. The result should be easier to understand and act on than a raw
Markdown file, a paginated PDF, or an ad hoc generated website.

## Why the Product Exists

Technical users already ask coding agents to test APIs, investigate systems,
write guidelines, and produce technical documentation. The work becomes
awkward when its results need to be delivered to other people:

- **Markdown** is portable and efficient for an agent to write, but dense
  technical reports can be difficult to navigate, scan, and explore.
- **PDF** is familiar and easy to share, but pagination interrupts the reading
  flow and makes useful interaction such as navigation, filtering, and
  expandable JSON or code details difficult.
- **Hand-generated HTML** can provide those interactions, but repeatedly
  generating structure, styles, and behavior consumes agent tokens. Without
  reusable components and themes, the result is also harder to keep polished
  and visually consistent.
- **A conventional frontend project** provides reuse and structure, but its
  scaffolding, dependencies, build configuration, and deployment are excessive
  when the goal is to share one bounded artifact.

The core pain is the lack of a low-friction format for agent-authored technical
content that is portable, human-readable, interactive, efficient to generate,
and visually consistent. yolojsx fills that gap with an agent-facing JSX
authoring contract and a human-facing application that can normally be shared
as one HTML file.

The initial use case was an API test report written by the same coding agent
that performed the tests. The report needed to help an engineering team
understand failures, navigate findings, and reveal detailed JSON only when
needed. The same problem recurs anywhere the information matters more than
maintaining a web project:

- **API test reports:** preserve a continuous reading flow, expose details on
  demand, and support filtering, copying, and status summaries without PDF page
  gaps.
- **Internal setup guides:** make procedures scannable, navigable, and easier to
  follow than raw Markdown.
- **Feature demos:** provide a quick interactive artifact without project
  scaffolding or deployment work.
- **Design comparisons:** let product owners compare options, inspect tradeoffs,
  and record a decision in one coherent experience.
- **Small development tools:** package focused browser utilities, such as a JWT
  decoder, that are convenient to keep or share.

These are representative uses, not a whitelist. The common shape is a bounded,
content-rich application whose value comes from portability, clarity, and useful
interaction.

## Product Model

### Input

The normal input is one `.jsx` entry that default-exports a React component. AI
agents are the primary authors, although ordinary human-authored JSX remains
supported.

The source should be compact and content-first:

- use the supplied stack before custom infrastructure;
- represent repeated content as data and map it into the UI;
- add state only for useful interaction;
- keep one-off layouts local instead of creating speculative abstractions;
- avoid generated boilerplate, invented content, and ornamental complexity.

The JSX itself should remain understandable enough to diagnose and revise, but
source prettiness must not outrank the quality of the rendered result.

### Output

yolojsx has two first-class output modes:

1. **Portable HTML:** the default build emits one `.html` file. Its application
   payload is gzip-compressed, embedded in the file, and restored by the
   browser's native `DecompressionStream("gzip")`. It requires no neighboring
   local assets or server, but loads exact-version supplied runtimes from a CDN
   by default. `--self-contained` embeds those runtimes for offline use.
2. **Deployable directory:** `--out-dir` emits a conventional `dist/`-style
   static asset directory for normal hosting, strict Content Security Policy,
   or application graphs that cannot be represented by the single-file packer.

Prefer portable HTML when requirements do not distinguish between the modes,
but never weaken directory output to serve the default path. Correct behavior
and an honest diagnostic are more important than forcing an incompatible
application into one file.

Portable does not mean every resource must be embedded. Controlled runtime
modules, remote fonts, images, and intentional API calls are allowed. Agents
should preserve essential meaning when an important remote resource fails—for
example with nearby text, useful `alt` text, or one focused fallback—without generating defensive markup
for every enhancement.

## Priorities

Apply these priorities in order when requirements conflict:

1. **Reliable, portable output and correct behavior.** Do not trade correctness,
   filesystem safety, or an artifact's ability to start for appearance,
   compression, or convenience.
2. **Agent-first operation.** Keep the CLI, diagnostics, documentation, examples,
   conventions, and official skills predictable for AI agents.
3. **Human comprehension.** Make rendered information legible, scannable,
   well-structured, and easy to act on.
4. **Useful interaction, responsive UX, and accessibility.** Interaction should
   help complete a task, not merely demonstrate React.
5. **Consistent visual quality.** Let yolojsx themes and the supplied stack carry
   the design system.
6. **Compact, reusable, token-efficient JSX.** Spend tokens on the user's content
   and decisions rather than scaffolding and repeated styling.
7. **Small artifact size.** Reduce bytes only after the higher priorities hold.

Compression supports portability. It is not a security boundary and must not
outrank correctness, usability, or clarity.

## Agent-First Experience

Agent-first means a user should not need to translate a product request into
frontend setup instructions. An agent should be able to discover:

- which packages yolojsx supplies;
- the expected JSX entry contract;
- how themes and semantic styling work;
- when to use portable HTML or directory output;
- which application shapes the single-file packer supports;
- how to build and diagnose the smallest relevant artifact;
- the readability, interaction, and accessibility expectations.

Official skill files for Codex, Claude Code, Antigravity, OpenCode, and similar
agents are a product surface, not incidental contributor notes. Keep their
guidance aligned with CLI behavior, supported dependencies, themes, examples,
and this document. Prefer shared source guidance or mechanically synchronized
copies when multiple agent formats require the same content.

Agent-first does not mean agent-only. Diagnostics and commands must remain clear
to people, and normal JSX projects must not become awkward to support.

## Supplied Frontend Stack

Use the supplied stack before custom components, configuration, or large custom
stylesheets:

- **React:** component structure, derived values, and the minimum state required
  for useful interaction.
- **Vite:** the controlled development and production build environment.
- **Ant Design:** accessible controls, forms, tables, navigation, feedback, and
  other interactive components.
- **Tailwind CSS:** responsive layout, spacing, sizing, and focused utility
  styling.
- **yolojsx themes:** global typography, semantic colors, surfaces, focus,
  native elements, and Ant Design tokens.
- **React Icons:** recognizable supporting symbols. Import named icons from a
  specific collection and never use an icon as the only accessible label.
- **PrismJS:** language-aware syntax highlighting. Import only the languages an
  artifact uses; prefer plain `<pre><code>` for short or language-neutral text.

The stack is a division of responsibility, not a requirement to use every
package. Static content should remain static. Native browser features should
handle small needs such as clipboard, download, date, color, and file input when
they are sufficient.

## Human-Readable Output

“Human-readable” describes the rendered website, not the generated HTML source.
It has three connected layers.

### Legibility

Legibility is the physical clarity of individual characters and controls.

- Use body text of at least `16px`; `18–20px` is often better for long-form
  desktop reading.
- Meet WCAG AA contrast: at least `4.5:1` for normal text and `3:1` for large
  text.
- Preserve visible keyboard focus and clear disabled, selected, error, and
  success states.
- Prefer comfortable foreground and background colors. Where the theme permits,
  near-black on an off-white surface is often less harsh than pure black on pure
  white.
- Prefer familiar system or variable font stacks that load quickly and avoid
  layout shift. A remote font is an enhancement, not a reason to hide content.
- Do not encode meaning through color or icons alone.

### Readability

Readability is how easily words, sentences, and sections flow without visual
fatigue.

- Keep prose lines around `45–75` characters, with roughly `60` characters as a
  useful target.
- Use line height around `1.4–1.6`.
- Separate paragraphs with visible space, normally around `1.5–2` times the body
  text size.
- Prefer paragraphs of `2–4` sentences for information intended to be scanned.
  Use longer paragraphs only when continuity genuinely helps.
- Use a distinct heading scale, commonly a `1.25–1.414` ratio between levels,
  while preserving semantic heading order.
- Use responsive typography and measures, including `clamp()` or equivalent
  theme utilities when useful, so mobile and widescreen layouts remain
  comfortable.
- Make wide tables, code blocks, and dense toolbars usable on small screens.

These values are defaults, not reasons to override a well-designed theme or
break a specialized visualization.

### Comprehension

Comprehension is how easily a reader can understand, retain, and act on the
information.

- Lead with the conclusion, status, or action the audience needs.
- Build a clear first-, second-, and third-level visual hierarchy.
- Use semantic landmarks such as `<header>`, `<main>`, `<nav>`, `<article>`,
  `<section>`, and ordered `<h1>`–`<h6>` headings so browsers and assistive
  technology can interpret the document.
- Design for scanning. Support common F-shaped and layer-cake reading patterns
  with descriptive headings, short sections, bold lead-ins, lists, summary
  blocks, and meaningful whitespace.
- Group related information and use progressive disclosure for secondary
  details.
- Use tables for exact comparisons, not general page layout.
- Do not turn every sentence into a card; excessive containers weaken hierarchy
  and increase cognitive load.
- Expose the next meaningful action and make its result visible.

## Interaction and Accessibility

Interactivity is valuable when it helps a person filter, compare, inspect, copy,
calculate, validate, navigate, or complete a task.

- Show useful initial content instead of an empty dashboard.
- Add loading, empty, error, disabled, and success states only when the workflow
  can reach them.
- Keep controls keyboard accessible and label inputs explicitly.
- Label icon-only controls and hide decorative icons from assistive technology.
- Use semantic controls before clickable generic containers.
- Announce important asynchronous results with an appropriate visible and
  assistive feedback mechanism.
- Keep responsive behavior part of the component design, not a desktop-only
  cleanup pass.
- Avoid interaction whose only purpose is visual novelty.

Accessibility basics, trust-boundary validation, and error handling that
prevents data loss are never optional simplifications.

## Content and Visual Direction

The content is the product. Themes and components should clarify it rather than
compete with it.

- Put real findings, instructions, tradeoffs, and next actions before decorative
  chrome.
- Use yolojsx semantic tokens and theme behavior instead of hard-coded page-wide
  palettes.
- Use whitespace to separate concepts and reduce overload.
- Use concise callouts for genuinely important context, risks, or decisions.
- Avoid large custom CSS files, generated `.ant-*` overrides, custom design
  systems, and one-artifact framework layers.
- Do not invent metrics, testimonials, links, or actions that imply unavailable
  behavior.
- Ask for missing source data or label placeholders clearly.

## Product Decision Checklist

A change supports the vision when the answers remain yes:

- Does the artifact start reliably in every output mode it claims to support?
- Can an agent discover the correct authoring and CLI path without guessing?
- Can a reader identify the conclusion, structure, and next action quickly?
- Does interaction improve understanding or task completion?
- Is the result usable with a keyboard and on a small screen?
- Does it reuse the supplied stack and theme instead of rebuilding them?
- Is the JSX focused on content rather than scaffolding?
- Were artifact-size optimizations made only after those needs were satisfied?

When a product change alters any answer, update the relevant OpenSpec
requirement, CLI or README documentation, and official agent skill guidance
together.
