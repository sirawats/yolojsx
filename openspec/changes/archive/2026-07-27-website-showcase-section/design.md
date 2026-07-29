## Context

`website/index.jsx` is built by yolojsx itself. The first implementation duplicated seven example imports, all theme families, and the semantic CSS variable mapping. It also used four related state values for theme paging and selection.

Direct imports from sibling `examples/` modules expose a separate build issue: the controlled Tailwind source scan currently covers only the entry directory, so those components compile without all of their utility styles.

## Goals / Non-Goals

**Goals:**

- Include every packaged example without editing the website for each addition.
- Present examples in a desktop 20:80 navigation-to-preview layout with a stacked mobile fallback.
- Page through theme families and expose contextual variants.
- Switch the example between independent desktop and mobile preview viewports.
- Use the canonical theme catalog and CSS renderer.
- Preserve Tailwind utilities from local modules elsewhere in the invoked project.

**Non-Goals:**

- Client-side routing or URL state.
- Runtime filesystem access.
- Carousel behavior or theme metadata maintained by the website.
- New dependencies.

## Decisions

### Discover examples with Vite's eager glob import

Use `import.meta.glob("../examples/*.jsx", { eager: true, import: "default" })`. Vite expands the literal glob at build time, so browser code never accesses the filesystem. Eager loading keeps every example in the single output chunk required by compressed HTML builds.

Derive display names from filenames. An example becomes available after adding its default-exported `.jsx` file and rebuilding.

### Use a 20:80 showcase with paged theme controls

Use a `1fr 4fr` desktop grid for generated example buttons and the preview. Stack the regions on narrow screens.

Render four derived theme families per page below the grid, with previous and next buttons and contextual variant buttons for the active family. Store only the active example id, active theme id, and family page index; derive the active family and visible page data.

### Derive themes and reuse the existing renderer

Build theme groups from `THEMES`, using catalog aliases and names instead of listing 21 presets again. Store only the active theme id.

Convert the selected theme's Ant Design algorithm string to the matching Ant Design algorithm function and pass the existing `cssVar`, `token`, and `components` values to a nested `ConfigProvider`.

Render `renderThemeCss(selectedTheme)` inside the preview document rather than rebuilding its semantic CSS property mapping in JSX.

### Render responsive previews in an iframe

Render the active example through a React portal into a same-origin `srcDoc` iframe. An iframe is required because CSS media queries evaluate the document viewport, not an ordinary container's width.

Copy the generated application stylesheet into the iframe, direct nested Ant Design CSS-in-JS output to its head, and render the selected theme at its `:root`. Keep the existing 70% scaled content canvas inside the iframe.

Use the existing Ant Design `Segmented` component with text labels rather than adding `react-icons` for two decorative glyphs. Desktop fills the preview width at 16:9; mobile is centered with a 6:13 ratio and a phone-sized maximum width.

### Scan the invoked project when safe

When the resolved entry is inside the invocation directory, use that directory as the Tailwind source tree. Otherwise retain the entry directory boundary. This covers sibling local imports such as `website/` importing `examples/` without scanning an unrelated parent directory.

This conforms to the existing `bundled-frontend-stack` requirement that utilities from imported local components are generated.

## Risks / Trade-offs

- **[Risk] Project-root scanning can inspect more local source than entry-directory scanning** → Keep automatic Tailwind detection disabled and scan only the explicit invocation tree; fall back to the entry directory for external entries.
- **[Risk] A malformed example lacks a default component export** → Vite fails the build, matching the existing entry-component contract.
- **[Risk] Example state persists while changing themes** → Keep the same component mounted so users can compare themes without losing their work.
- **[Risk] Theme family controls become cramped on narrow screens** → Allow the generated family and variant buttons to wrap within the stacked showcase.
- **[Risk] Iframe styles diverge from the generated page** → Clone the page's generated stylesheets on iframe load and direct preview-specific Ant Design styles to the iframe head.
