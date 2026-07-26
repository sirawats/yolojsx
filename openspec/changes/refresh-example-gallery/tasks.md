## 1. Supply the new frontend dependencies

- [x] 1.1 Extend `src/dependencies.js` so React Icons collection imports and PrismJS runtime/language-module imports resolve from yolojsx when the input project has no local copies.
- [x] 1.2 Add focused build coverage for `react-icons/lu` and PrismJS language imports, including an input fixture without local installations and assertions for successful file and directory builds.
- [x] 1.3 Dynamically discover PrismJS and `prism-themes` stylesheets, resolve a literal `YOLOJSX.prismTheme` name to one stylesheet, and expose CLI discovery.

## 2. Refresh the packaged examples

- [x] 2.1 Delete `examples/Home.jsx` and rename `examples/CalculatorDemo.jsx` to `examples/TaxCalculator.jsx`.
- [x] 2.2 Rewrite `TaxCalculator.jsx` as an accessible, interactive illustrative progressive-income estimator with local demo brackets, filing profile, deductions, credits, estimated tax, effective rate, take-home result, and clear not-tax-advice labeling.
- [x] 2.3 Use React Icons only where they add meaningful, accessible visual cues in the refreshed examples, retaining the existing APIDocs and SaaS icon usage.
- [x] 2.4 Add PrismJS highlighting to APIDocs request languages and JSON response output, importing only the grammars it renders and preserving copy behavior and static code safety.
- [x] 2.5 Select a discovered Prism theme for APIDocs and the website code panels.

## 3. Synchronize catalog references

- [x] 3.1 Update `test/integration/examples.test.js` to remove Home and CalculatorDemo expectations, build TaxCalculator in both output modes, and assert the new example content.
- [x] 3.2 Update the README example gallery and example commands for TaxCalculator, removing the packaged Home entry while preserving generic `Home.jsx` CLI examples.
- [x] 3.3 Update AGENTS, CONTRIBUTING, and RELEASING smoke-test guidance that specifically points to `examples/Home.jsx`; keep generic Home fixture and command documentation unchanged.
- [x] 3.4 Search for stale packaged-example references and confirm the website continues to discover the remaining examples through its existing glob without a manual catalog.

## 4. Verify the change

- [x] 4.1 Run formatting, linting, syntax checks, focused example/dependency tests, and the full `npm run verify` gate.
