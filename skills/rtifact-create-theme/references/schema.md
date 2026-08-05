# ThemeDefinition field reference

Use this reference when authoring or debugging a custom Rtifact theme module.
The SKILL.md contrast matrix and failure guide are authoritative; this file
documents every field's type, requirement, and allowed values.

- [Top-level fields](#top-level-fields)
- [`css` string](#css-string-optional)
- [`source` object](#source-object)
- [`colors` object](#colors-object)
- [`typography` object](#typography-object)
- [`rhythm` object](#rhythm-object)
- [`components` object](#components-object)
- [`radius` object](#radius-object)
- [`status` object](#status-object-optional)

## Top-level fields

| Field           | Type                  | Required | Notes                                                                                                               |
| --------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`            | string                | Yes      | Lowercase kebab-case. Must be unique when installed alongside other custom themes.                                  |
| `name`          | string                | Yes      | Human-readable display name shown by `rtifact themes`.                                                              |
| `aliases`       | string[]              | No       | Additional preset names that resolve to this theme.                                                                 |
| `appearance`    | `"light"` \| `"dark"` | Yes      | Exactly one of these two strings. Controls Ant Design's algorithm selection and Tailwind's dark-mode utility class. |
| `description`   | string                | Yes      | One-sentence description of the theme's intent.                                                                     |
| `source`        | object                | Yes      | Provenance record. All four sub-fields are required.                                                                |
| `colors`        | object                | Yes      | Semantic color palette. See Colors section.                                                                         |
| `typography`    | object                | Yes      | Font stack choices.                                                                                                 |
| `rhythm`        | object                | Yes      | Prose rhythm and heading weight.                                                                                    |
| `components`    | object                | Yes      | Component-level sizing and spacing tokens.                                                                          |
| `radius`        | object                | Yes      | Border-radius scale with three named sizes.                                                                         |
| `shadow`        | string                | Yes      | Default elevation shadow, e.g. `"0 18px 48px rgb(0 0 0 / 0.35)"`.                                                   |
| `controlHeight` | number                | Yes      | Default Ant Design control height in pixels (e.g. `38`).                                                            |
| `status`        | object                | No       | Override any subset of status roles. Omit to use built-in light/dark status palette.                                |
| `css`           | string                | No       | Embedded custom CSS string applied to the document after theme variables under `@layer components`.                 |

---

## `css` string (optional)

Use `css` for theme-wide selectors or pseudo-elements that the structured theme
tokens cannot express. Omit it when semantic tokens, Ant Design component
tokens, or application Tailwind classes already cover the need.

```jsx
css: `
  .brand-kicker {
    color: var(--primary);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
`,
```

Rtifact inserts the raw string after theme variables in `@layer components` for
default, self-contained, and directory JSX builds. Use generated semantic
variables such as `var(--primary)`, `var(--foreground)`, and `var(--code)`.
Do not wrap the string in another `@layer components`, and do not patch Ant
Design with `.ant-*` selectors; use the `components` fields instead. The field
must be a string. Vite reports malformed CSS as a build error.

---

## `source` object

All four fields are required. For a prompt-only brief with no file or URL,
use a descriptive URN such as `urn:rtifact-source:user-supplied-brand-brief`.

| Field      | Type   | Notes                                                                    |
| ---------- | ------ | ------------------------------------------------------------------------ |
| `name`     | string | Human-readable name of the source reference.                             |
| `url`      | string | File path, public URL, or descriptive URN.                               |
| `revision` | string | Date or version string, e.g. `"captured 2026-08-01"`.                    |
| `license`  | string | Rights statement, e.g. `"User-supplied reference; rights not assessed"`. |

---

## `colors` object

All colors must be full six-digit hex strings (`#rrggbb`). Shorthand hex (`#rgb`),
alpha hex (`#rrggbbaa`), CSS variables, and named colors are invalid and cause
a build error.

| Field                | Required | Default           | Role                                                                                                                            |
| -------------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`             | Yes      | —                 | Page background                                                                                                                 |
| `surface`            | Yes      | —                 | Card and panel background                                                                                                       |
| `surfaceRaised`      | Yes      | —                 | Elevated popover/drawer background                                                                                              |
| `text`               | Yes      | —                 | Primary body text                                                                                                               |
| `textMuted`          | Yes      | —                 | Secondary / supporting text                                                                                                     |
| `border`             | Yes      | —                 | Dividers, input outlines, card edges                                                                                            |
| `primary`            | Yes      | —                 | Filled control background (buttons, selected state)                                                                             |
| `primaryText`        | Yes      | —                 | Text on filled primary controls                                                                                                 |
| `primaryAccent`      | No       | = `primary`       | Accent color used for hover highlights and active indicators; set separately when `primary` fails the 3:1 accent contrast check |
| `primaryAccentHover` | No       | = `primaryAccent` | Hover state of the accent color                                                                                                 |
| `link`               | No       | = `primary`       | Hyperlink color; set separately when `primary` fails the 4.5:1 link contrast check                                              |
| `focus`              | Yes      | —                 | Focus ring and primary border color                                                                                             |
| `selection`          | Yes      | —                 | Text selection background                                                                                                       |
| `selectionText`      | Yes      | —                 | Text on selected text regions                                                                                                   |
| `codeBackground`     | Yes      | —                 | `<pre>` / inline code background                                                                                                |

### Contrast requirements (WCAG AA)

| Pair                                                      | Minimum |
| --------------------------------------------------------- | ------- |
| `text` / `canvas`                                         | 4.5:1   |
| `text` / `surface`                                        | 4.5:1   |
| `textMuted` / `canvas`                                    | 3:1     |
| `link` / `canvas`                                         | 4.5:1   |
| `primaryText` / `primary`                                 | 4.5:1   |
| `primaryAccent` and hover / `surface` and `surfaceRaised` | 3:1     |
| `focus` / `canvas`, `surface`, `surfaceRaised`            | 3:1     |
| `link` / `surface` and `surfaceRaised`                    | 3:1     |
| `selectionText` / `selection`                             | 4.5:1   |
| Status `foreground` / `background`                        | 4.5:1   |

**Practical tip:** When a pair fails, compute contrast with the browser DevTools
color picker (eyedropper → check contrast), `colorjs.io`, or the APCA Contrast
Calculator. For normal 16 px body text WCAG AA requires 4.5:1; for large text
(≥ 18 px regular or ≥ 14 px bold) the threshold drops to 3:1.

---

## `typography` object

| Field     | Required | Notes                                                   |
| --------- | -------- | ------------------------------------------------------- |
| `sans`    | Yes      | CSS font-family stack for body text.                    |
| `heading` | No       | CSS font-family stack for headings. Defaults to `sans`. |
| `mono`    | Yes      | CSS font-family stack for code and monospace content.   |

---

## `rhythm` object

| Field            | Required | Notes                                                             |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `lineHeight`     | Yes      | Unitless line-height for body text, e.g. `1.6`.                   |
| `headingWeight`  | Yes      | CSS `font-weight` integer for headings, e.g. `600`.               |
| `letterSpacing`  | Yes      | CSS `letter-spacing` value, e.g. `"-0.01em"`.                     |
| `contentMeasure` | Yes      | Max prose line length as a CSS `max-width` value, e.g. `"76rem"`. |

---

## `components` object

| Field                | Type   | Required | Default | Notes                                              |
| -------------------- | ------ | -------- | ------- | -------------------------------------------------- |
| `buttonPadding`      | number | Yes      | —       | Horizontal padding in pixels for buttons.          |
| `buttonShadow`       | string | Yes      | —       | CSS `box-shadow` value for buttons.                |
| `cardBorderWidth`    | number | No       | `1`     | Border width in pixels for cards.                  |
| `cardPadding`        | number | Yes      | —       | Inner padding in pixels for cards.                 |
| `cardHeaderHeight`   | number | Yes      | —       | Card header height in pixels.                      |
| `menuItemHeight`     | number | Yes      | —       | Menu item height in pixels.                        |
| `menuItemMargin`     | number | Yes      | —       | Vertical margin in pixels between menu items.      |
| `segmentedPadding`   | number | Yes      | —       | Padding in pixels inside segmented control tracks. |
| `tabGutter`          | number | Yes      | —       | Horizontal spacing in pixels between tab items.    |
| `titleMarginTop`     | string | Yes      | —       | CSS margin-top for headings, e.g. `"1.25em"`.      |
| `titleMarginBottom`  | string | Yes      | —       | CSS margin-bottom for headings, e.g. `"0.5em"`.    |
| `inputPaddingInline` | number | Yes      | —       | Horizontal padding in pixels inside inputs.        |
| `inputPaddingBlock`  | number | Yes      | —       | Vertical padding in pixels inside inputs.          |

---

## `radius` object

Three named sizes that map to Tailwind's `rounded-*` utilities and Ant Design's
`borderRadius` token family.

| Field    | Required | Example      |
| -------- | -------- | ------------ |
| `small`  | Yes      | `"0.25rem"`  |
| `medium` | Yes      | `"0.5rem"`   |
| `large`  | Yes      | `"0.875rem"` |

---

## `status` object (optional)

Override any subset of status roles. Omit entirely to use the built-in palette
for the selected `appearance`. All four sub-fields are optional within each
role — any omitted sub-field falls back to the built-in value. Provide all
four for complete control and to avoid unexpected fallbacks.

```jsx
status: {
  danger:  { seed: "#d8574d", foreground: "#ffd5d0", background: "#5b1f1b", border: "#d8574d" },
  warning: { seed: "#d4890a", foreground: "#ffe4b0", background: "#5b3a07", border: "#d4890a" },
  success: { seed: "#3d9a5e", foreground: "#c6f0d7", background: "#0e3a22", border: "#3d9a5e" },
  info:    { seed: "#4191d4", foreground: "#bde0ff", background: "#0e2d4a", border: "#4191d4" },
},
```

| Sub-field    | Role                                                     |
| ------------ | -------------------------------------------------------- |
| `seed`       | Ant Design algorithm seed color (controls, badges, tags) |
| `foreground` | Text/icon color on the status background                 |
| `background` | Status surface color                                     |
| `border`     | Status border and icon color                             |
