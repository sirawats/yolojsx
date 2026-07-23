## ADDED Requirements

### Requirement: Default HTML output
The CLI SHALL derive the default HTML destination from the JSX entry basename and place it beneath the invocation working directory when neither `--output` nor `--out-dir` is provided.

#### Scenario: Default output selection
- **WHEN** a user runs `yolojsx Home.jsx` from `/workspace/site` without an output option
- **THEN** the resolved HTML destination is `/workspace/site/Home.html`

#### Scenario: Nested entry output selection
- **WHEN** a user runs `yolojsx pages/Dashboard.jsx` from `/workspace/site` without an output option
- **THEN** the resolved HTML destination is `/workspace/site/Dashboard.html`

## REMOVED Requirements

### Requirement: Default output directory
**Reason**: A direct compressed HTML artifact replaces `dist/` as the default JSX build result.

**Migration**: Invoke `yolojsx Home.jsx --out-dir dist` to retain the previous directory output behavior.
