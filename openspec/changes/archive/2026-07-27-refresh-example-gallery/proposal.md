## Why

The packaged example gallery still presents a generic `Home.jsx` starter and a SaaS unit-economics calculator, while the repository now supplies React Icons, PrismJS, and Prism Themes for richer, more representative examples. Refreshing the gallery will make the examples better demonstrations of the supported stack and keep tests and documentation aligned with the files users can actually build.

## What Changes

- **BREAKING** Remove the packaged `examples/Home.jsx` showcase entry.
- Rename and rewrite `examples/CalculatorDemo.jsx` as `examples/TaxCalculator.jsx`, replacing the unit-economics scenario with an illustrative, interactive tax estimator.
- Use `react-icons` in examples where recognizable interface symbols improve the existing interaction, and use PrismJS for the API example’s language-aware request and response code blocks.
- Ensure the supplied React Icons, PrismJS, and Prism Themes packages resolve for JSX entries without requiring users to install them beside yolojsx.
- Update example integration coverage, README gallery commands, and repository smoke-test guidance for the new catalog.
- Preserve generic `Home.jsx` command examples and test fixtures where they describe user-created input files rather than the packaged gallery.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `bundled-frontend-stack`: Treat the packaged React Icons, PrismJS, and Prism Themes dependencies as supplied frontend-stack packages available to input entries.

## Impact

- Affected examples: `examples/Home.jsx`, `examples/CalculatorDemo.jsx`, and the applicable icon/code examples.
- Affected catalog consumers: `test/integration/examples.test.js`, README example tables and commands, and maintainer/contributor smoke-test instructions.
- Affected build resolution: `src/dependencies.js` and focused dependency/build tests.
- No CLI command syntax, output format, theme contract, or website discovery mechanism changes.
