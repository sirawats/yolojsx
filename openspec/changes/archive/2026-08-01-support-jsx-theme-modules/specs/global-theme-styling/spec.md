## ADDED Requirements

### Requirement: Local TypeScript theme selection

The JSX build form SHALL accept `--theme <file.ts|file.jsx>` in default HTML
file, self-contained HTML file, and explicit directory modes, SHALL resolve the
file from the invocation working directory, and SHALL require a readable regular
TypeScript or JSX file before starting a build. Exact built-in preset ids and
aliases SHALL continue to select their catalog themes.

#### Scenario: Select TypeScript theme module

- **WHEN** a user builds with `--theme themes/company.ts`
- **THEN** the CLI loads the canonical local file and applies its default theme manifest

#### Scenario: Select JSX theme module

- **WHEN** a user builds with `--theme themes/company.jsx`
- **THEN** the CLI loads the canonical local file and applies its default theme manifest

#### Scenario: Theme path is resolved from invocation directory

- **WHEN** a user invokes Rtifact from a directory containing `themes/company.jsx`
- **THEN** the relative theme argument resolves from that invocation directory rather than from the entry file or package installation

#### Scenario: Invalid local theme input

- **WHEN** the selected theme path is missing, unreadable, not a regular file, or has an unsupported extension
- **THEN** the CLI exits unsuccessfully before creating output and identifies the invalid theme source

#### Scenario: Unknown non-path theme

- **WHEN** a user supplies a value that is neither a supported preset or alias nor a `.ts` or `.jsx` path
- **THEN** the CLI retains the unknown-theme diagnostic and identifies the theme-discovery command

### Requirement: Custom theme module contract

A local theme module SHALL use its default export as one declarative theme
definition, SHALL allow named exports to remain ordinary application modules,
and SHALL NOT auto-register or inject named exports into application scope.

#### Scenario: Default theme definition

- **WHEN** a selected module default-exports a valid theme definition
- **THEN** the generated semantic CSS and Ant Design provider configuration are derived from that definition

#### Scenario: Reusable named component

- **WHEN** a JSX theme module named-exports a React component and the application imports it explicitly
- **THEN** the normal application build includes and renders that component

#### Scenario: Named export is not imported

- **WHEN** a theme module has a named component export that the application does not import
- **THEN** Rtifact does not expose that component as a global or render it implicitly

### Requirement: Custom theme validation

The CLI SHALL normalize and validate a custom theme definition with the same
identifier, provenance, appearance, semantic color, contrast, typography,
rhythm, serialization, Ant Design token, and supported component-override
constraints applied to built-in themes. Theme modules SHALL be treated and
documented as trusted local code executed during the build.

#### Scenario: Valid custom manifest

- **WHEN** a local theme default export satisfies the complete theme contract
- **THEN** the CLI applies its resolved semantic and Ant Design configuration in every output mode

#### Scenario: Missing default export

- **WHEN** a selected local theme module has no object default export
- **THEN** the CLI exits unsuccessfully before creating output and identifies the theme source and missing manifest

#### Scenario: Invalid custom manifest

- **WHEN** a custom definition violates a theme validation constraint
- **THEN** the CLI exits unsuccessfully before creating output and identifies both the theme source and the invalid field or relationship

#### Scenario: Theme module evaluation fails

- **WHEN** compiling or evaluating the selected local theme module fails
- **THEN** the CLI exits unsuccessfully before creating output and reports an actionable diagnostic associated with that module

## MODIFIED Requirements

### Requirement: Stable theme cascade

The controlled stylesheet graph SHALL declare and preserve the cascade order
`theme`, `base`, `antd`, `components`, and `utilities`, SHALL import the
generated semantic stylesheet for the selected built-in or custom theme, SHALL
let Tailwind Preflight own the global reset, SHALL avoid importing Ant Design
reset CSS in the normal runtime-styling path, and SHALL keep Ant Design
customization in the generated provider token configuration rather than CSS
selector overrides.

#### Scenario: Utility overrides Ant Design styling

- **WHEN** a supported Ant Design semantic slot receives a standard Tailwind utility class under a themed build
- **THEN** the utility-layer declaration takes precedence over the Ant Design layer without requiring `!important`

#### Scenario: Plain element receives one reset

- **WHEN** a generated application renders an unstyled HTML element
- **THEN** its reset behavior comes from Tailwind Preflight without a second Ant Design global reset competing with it

#### Scenario: Theme does not patch Ant Design selectors

- **WHEN** a built-in or custom theme needs distinct component shapes, density, elevation, or interaction states
- **THEN** those differences are supplied through Ant Design global or component tokens and the generated theme stylesheet contains no `.ant-*` component patch

#### Scenario: Application imports local CSS

- **WHEN** application JSX imports a local stylesheet through its normal module graph
- **THEN** Vite processes that stylesheet and its file-relative assets without treating it as a second theme manifest or privileged cascade slot

## REMOVED Requirements

### Requirement: Custom global CSS overrides

**Reason**: `--css` cannot configure the coordinated semantic and Ant Design
runtime contract and duplicates the normal Vite CSS import path.

**Migration**: Move product-wide semantic values into a `.ts` or `.jsx` theme
module selected with `--theme`; import remaining application-specific CSS from
the JSX or TSX application module.
