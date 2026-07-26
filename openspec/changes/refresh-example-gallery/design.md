## Context

The website discovers packaged examples from `examples/*.jsx`, while integration tests and README tables maintain the expected example names and showcase content separately. The current gallery includes a generic `Home.jsx` starter and `CalculatorDemo.jsx`, and only APIDocs and SaaS currently demonstrate React Icons. APIDocs renders useful request and response code but does not yet use the bundled PrismJS dependency.

The CLI aliases only the core React, Ant Design, and Tailwind packages. React Icons subpaths and PrismJS imports therefore need explicit resolution support if they are to be genuinely supplied to entries that do not have their own frontend installation.

## Goals / Non-Goals

**Goals:**

- Replace the packaged starter with a focused tax-calculator example while preserving the automatic website catalog.
- Make the tax example an accessible, interactive, illustrative progressive-income estimator with clearly labeled demo assumptions.
- Use React Icons where symbols improve existing example controls or summaries, and use PrismJS for APIDocs request and JSON response code.
- Make the supported React Icons and PrismJS imports resolve from the yolojsx package and add focused build coverage.
- Keep documentation, smoke tests, and example integration expectations synchronized with the new filenames.

**Non-Goals:**

- No change to CLI commands, output modes, themes, website layout, or example discovery.
- No jurisdiction-specific tax advice, production tax engine, live tax rates, external API calls, or user accounts.
- No forced icon or syntax-highlighting usage in examples without meaningful iconography or code content.
- No additional syntax-highlighting runtime beyond PrismJS and its CSS-only
  `prism-themes` companion.

## Decisions

### Use an illustrative tax model

`TaxCalculator.jsx` will calculate an annual estimate from gross income, filing profile, deductions, and credits using local, clearly labeled demo brackets. It will show estimated tax, effective rate, and take-home amount, and identify the result as illustrative rather than claiming current legal accuracy.

An actual jurisdiction-specific ruleset was rejected because the request does not identify a jurisdiction and tax rules are time-sensitive. A static result was rejected because the calculator should demonstrate useful React state and derived values.

### Keep the existing example discovery mechanism

Delete `Home.jsx` and rename the calculator file; do not add a manual catalog. The existing `import.meta.glob("../examples/*.jsx")` continues to include every default-exported example automatically.

### Apply dependencies by content fit

Keep the existing React Icons usage in APIDocs and SaaS, add only semantically useful icons to the tax calculator, and leave Analytics, Techspec, and Editorial unchanged unless implementation reveals a clear accessible use. Highlight APIDocs request languages and JSON response data with PrismJS, importing only the grammars it renders. Plain text remains plain `<pre><code>` where highlighting adds no value.

### Resolve supplied packages through the CLI

Extend the package alias/resolution path for `react-icons` collection imports and PrismJS plus its language modules. Add a fixture build that imports these packages without local copies, while preserving ordinary input-project resolution for unrelated bare imports.

Discover Prism theme names from the installed `prismjs/themes` and
`prism-themes/themes` directories. Resolve a literal `YOLOJSX.prismTheme` name
to one inlined stylesheet during the entry transform so portable builds include
only the selected theme.

### Keep generic Home.jsx guidance

Update references that specifically mean the packaged example, such as the gallery table and example integration list. Retain generic `Home.jsx` commands and temporary test fixtures that demonstrate a user-created entry, replacing only smoke-test references that explicitly point at `examples/Home.jsx`.

## Risks / Trade-offs

- [Illustrative tax logic may be mistaken for financial advice] → Label the example and its bracket assumptions prominently; avoid jurisdiction, currency, and current-law claims.
- [PrismJS highlighted HTML can become unsafe if code becomes user-controlled] → Highlight only static/local example strings and keep arbitrary user input out of `dangerouslySetInnerHTML`.
- [More bundled imports can increase artifacts] → Import named icon modules and only the Prism grammars used by APIDocs; verify both output modes rather than adding a custom optimization layer.
- [Renaming removes a documented packaged file] → Mark the gallery removal as breaking, update all packaged-example references, and keep generic CLI `Home.jsx` guidance intact.
