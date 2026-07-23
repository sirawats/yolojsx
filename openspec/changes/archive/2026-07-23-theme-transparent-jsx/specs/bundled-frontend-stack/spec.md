## MODIFIED Requirements

### Requirement: Supplied Ant Design theme integration
The CLI SHALL supply one compatible Ant Design runtime graph and SHALL apply each selected preset through the generated `StyleProvider` and `ConfigProvider` boundary using official Ant Design algorithms, global tokens, CSS-variable configuration, and component tokens without requiring those packages to be installed beside the input file.

#### Scenario: Themed Ant Design component
- **WHEN** an entry imports an Ant Design component and selects a non-default preset
- **THEN** the generated provider applies the preset's global tokens, component tokens, and fixed algorithm before rendering the entry

#### Scenario: Light alias applies a fixed Ant Design theme
- **WHEN** a user selects an unsuffixed family alias such as `material`
- **THEN** the mounted provider applies the canonical light configuration without consulting the system color preference

#### Scenario: Standard component variants need no theme classes
- **WHEN** an entry renders supported Ant Design default, primary, text, link, ghost, or danger component variants using ordinary Ant Design props
- **THEN** the preset's official component tokens determine their normal, hover, active, focus, and disabled appearance without a yolojsx class name

#### Scenario: Built-in themes avoid generated selector overrides
- **WHEN** package verification inspects built-in theme stylesheets and generated configuration
- **THEN** Ant Design customization is represented by provider tokens and algorithms rather than CSS rules targeting generated `.ant-*` component selectors

