## MODIFIED Requirements

### Requirement: Direct single-file build selection

The JSX build form SHALL build and package the component as one CDN-backed HTML file by default without retaining an intermediate output directory, SHALL accept `--output` to select its destination, SHALL accept `--self-contained` to embed runtime dependencies, and SHALL temporarily accept `--single-file` as a deprecated compatibility alias for the CDN-backed default mode.

#### Scenario: Default single-file name

- **WHEN** a user runs `yolojsx Home.jsx` from a working directory
- **THEN** the CLI creates CDN-backed `Home.html` in that working directory

#### Scenario: Nested entry default name

- **WHEN** a user runs `yolojsx pages/Dashboard.jsx`
- **THEN** the CLI creates CDN-backed `Dashboard.html` in the invocation working directory

#### Scenario: Explicit single-file name

- **WHEN** a user runs `yolojsx Home.jsx --output index.html`
- **THEN** the CLI creates CDN-backed `index.html` at the path resolved from the invocation working directory

#### Scenario: Explicit self-contained file

- **WHEN** a user runs `yolojsx Home.jsx --self-contained`
- **THEN** the CLI creates `Home.html` with the controlled runtime embedded

#### Scenario: Deprecated explicit selection

- **WHEN** a user runs `yolojsx Home.jsx --single-file`
- **THEN** the CLI creates CDN-backed `Home.html` and writes a deprecation warning identifying the now-default file mode

#### Scenario: No retained intermediate directory

- **WHEN** a default or self-contained HTML-file build succeeds
- **THEN** temporary Vite output is cleaned and no `dist` directory is created solely for that build

## ADDED Requirements

### Requirement: Self-contained single-file option compatibility

The CLI SHALL accept `--self-contained` only for direct JSX file builds and SHALL keep the `pack` action self-contained without requiring that option.

#### Scenario: Self-contained output destination

- **WHEN** a JSX build uses `--self-contained --output public/index.html`
- **THEN** the CLI writes the self-contained artifact to the resolved explicit file destination

#### Scenario: Self-contained mode conflicts with directory options

- **WHEN** a JSX build combines `--self-contained` with `--out-dir` or `--base`
- **THEN** argument validation fails before building and explains that directory output already manages its own local assets

#### Scenario: Pack remains self-contained

- **WHEN** a user invokes `yolojsx pack dist --output index.html`
- **THEN** the CLI embeds the compatible build runtime without requiring `--self-contained`

#### Scenario: Self-contained selector is not a pack option

- **WHEN** a user supplies `--self-contained` to the `pack` action
- **THEN** argument validation fails and explains that `pack` output is already self-contained
