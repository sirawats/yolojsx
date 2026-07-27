## ADDED Requirements

### Requirement: Tree-shakeable supplied runtime

The CLI SHALL resolve supplied frontend packages through tree-shakeable module entry points when the package publishes them, while preserving the documented package imports and one compatible React runtime.

#### Scenario: Unused Ant Design components are excluded

- **WHEN** an entry imports a subset of named Ant Design components
- **THEN** the generated application excludes unrelated Ant Design component families from its executable bundle

#### Scenario: Output mode parity after tree-shaking

- **WHEN** the same entry is built as self-contained file output and directory output
- **THEN** both outputs retain equivalent React, Ant Design, theme, and interaction behavior

### Requirement: Controlled CDN runtime graph

The CLI SHALL define one exact-version CDN mapping for the supported external runtime set and SHALL ensure React, React DOM, Ant Design, and Ant Design CSS-in-JS consumers share one compatible React instance.

#### Scenario: Default file versions match the supplied stack

- **WHEN** a default JSX file build is generated
- **THEN** every remote runtime mapping uses the exact corresponding version controlled and tested by the installed yolojsx package

#### Scenario: Application-specific packages remain embedded

- **WHEN** a default file entry imports Prism language modules or named React Icons
- **THEN** the selected Prism and React Icons code remains in the application payload rather than becoming an additional remote runtime dependency
