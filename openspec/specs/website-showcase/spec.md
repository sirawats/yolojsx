# website-showcase Specification

## Purpose

Define how the project website discovers and previews packaged examples across responsive viewports and built-in themes.

## Requirements

### Requirement: Packaged example discovery

The website SHALL discover default-exported JSX modules from `examples/` at build time without listing each example import individually.

#### Scenario: Build with packaged examples

- **WHEN** the website is built
- **THEN** every default-exported `examples/*.jsx` module is available in the showcase

#### Scenario: Add a packaged example

- **WHEN** a new default-exported JSX file is added to `examples/`
- **THEN** the next website build includes it without changing `website/index.tsx`

### Requirement: Interactive example preview

The website SHALL provide a responsive example selector and preview the selected packaged example, using a 20:80 navigation-to-preview layout on desktop and a stacked layout on narrow screens.

#### Scenario: Switch packaged example

- **WHEN** a user selects an example
- **THEN** the preview renders that example

#### Scenario: View showcase on desktop

- **WHEN** the showcase has desktop-width space
- **THEN** example navigation occupies approximately 20 percent and the preview occupies approximately 80 percent

#### Scenario: View showcase on a narrow screen

- **WHEN** the showcase does not have desktop-width space
- **THEN** example navigation and preview stack without horizontal page overflow

### Requirement: Preview viewport modes

The website SHALL switch the example preview between an independent 16:9 desktop viewport and a centered 6:13 mobile viewport while retaining the configured content scale.

#### Scenario: Select desktop viewport

- **WHEN** a user selects Desktop
- **THEN** the example renders in a 16:9 viewport and responsive styles evaluate against that viewport

#### Scenario: Select mobile viewport

- **WHEN** a user selects Mobile
- **THEN** the example renders in a 6:13 viewport and responsive styles evaluate against that viewport

### Requirement: Scoped theme preview

The website SHALL derive its theme controls from the canonical theme catalog, page through theme families, expose variants for the selected family, and apply the selected preset to the example preview without changing the surrounding homepage theme.

#### Scenario: Switch theme preset

- **WHEN** a user pages to a theme family and selects one of its variants
- **THEN** the preview updates its semantic CSS variables, Ant Design configuration, native table treatment, and default Prism stylesheet to the selected preset

#### Scenario: Catalog gains a preset

- **WHEN** a preset is added to the canonical theme catalog
- **THEN** the next website build exposes it without adding a theme mapping to `website/index.tsx`
