## Context

Theme selection is currently synchronous: argument parsing rejects anything
outside the built-in registry, and the selected resolved theme is passed to the
generated CSS and Ant Design provider. `--css` is a separate path that can
override styles but cannot define the semantic and runtime token contract.

A `.jsx` theme has two consumers. The CLI needs its default manifest before the
application build, while application JSX may import its named React component
exports through the browser module graph. The loader must preserve yolojsx's
zero-setup aliases even when the input directory has no React or Ant Design
installation.

The bundled catalog still stores each preset manifest as a `.ts` source module.
Those files contain declarative default exports and compile to `.js` package
modules; migrating their source extension must preserve the existing registry,
validation, and package paths.

## Goals / Non-Goals

**Goals:**

- Accept built-in ids and local `.ts` or `.jsx` files through one `--theme`
  option.
- Use the existing manifest normalization and validation rules for custom
  themes.
- Let theme modules export ordinary reusable components without special
  registration or globals.
- Author every bundled preset manifest under `src/themes/` as a checked `.jsx`
  module.
- Preserve supplied React, Ant Design, React Icons, PrismJS, and Tailwind
  behavior in zero-install input directories.
- Remove the narrower `--css` CLI extension.

**Non-Goals:**

- Theme inheritance, merging, remote URLs, JavaScript theme files, or multiple
  simultaneous theme modules.
- Auto-importing named exports into the application.
- Adding a public `defineTheme` helper, runtime theme switching, or a new
  compiler dependency.
- Registering custom themes in the built-in `yolojsx themes` catalog.
- Removing custom `.ts` theme support or changing bundled preset values, ids,
  aliases, or visual behavior.

## Decisions

### Resolve presets synchronously and files asynchronously

Argument parsing will retain the raw `--theme` value and stop consulting the
theme registry. The CLI will resolve an exact built-in id or alias first. A
remaining value ending in `.ts` or `.jsx` will be resolved from the invocation
working directory, required to be a readable regular file, and canonicalized
before any output inspection or creation. Other values retain the existing
unknown-theme diagnostic.

This keeps parsing free of filesystem work and avoids ambiguous extensionless
paths. Treating every unknown value as a path was rejected because typos in
preset names would become misleading file errors.

### Use one module with two explicit consumers

The module's default export will be the existing declarative theme-definition
shape. Named exports may contain components, constants, and helpers, but they
have no CLI meaning; applications import them with normal relative imports.

```jsx
export default {
  id: "company",
  // semantic manifest
};

export function CompanyHero() {
  return <section className="bg-background">...</section>;
}
```

No global component injection or registration API will be added. Explicit
imports preserve ordinary TypeScript and Vite semantics and keep tree-shaking
predictable.

### Load only the default export with an in-memory Vite build

The CLI will create a virtual module that re-exports only the custom module's
default export, then run a silent, write-free, Node-targeted Vite build with
`configFile: false`, `envFile: false`, the existing React plugin, core package
aliases, and React deduplication. It will evaluate the resulting single
in-memory ES module and discard it after obtaining the manifest.

This approach reuses the installed build stack, handles JSX and CommonJS/ESM
dependencies, and gives theme modules the same supplied-package resolution as
application JSX. Direct Node import cannot parse JSX; Vite's experimental
module runner does not reliably evaluate the supplied CommonJS React and Ant
Design graph; `loadConfigFromFile` cannot apply yolojsx aliases for zero-install
input directories. A new loader dependency is therefore unnecessary.

The virtual default-only entry allows Vite to remove unused named component
exports from the build-time loader bundle. The browser application still
compiles any explicitly imported named exports through its normal Vite graph.

### Reuse the existing theme pipeline

The private definition-to-theme normalization will become reusable by the
custom loader. The resolved theme will then pass through the same catalog
validation used by built-ins, including identifier shape, provenance,
appearance, semantic colors, contrast, serializable Ant Design tokens,
typography, rhythm, and supported component overrides.

Missing, non-object, or invalid default exports and module build failures will
be wrapped in an actionable custom-theme diagnostic that identifies the source
file. The runtime provider will continue receiving only the normalized,
serializable resolved theme; component functions are never serialized into it.

### Include the custom module in Tailwind discovery

Build options will carry the canonical custom-theme source path separately from
the resolved theme. The generated Tailwind stylesheet will add that file as an
explicit `@source` alongside the existing application source tree. This covers
utility classes in exported components even when the theme file sits outside
the entry's scanned directory.

The normal application Vite build already supplies package aliases, so named
component exports require no second runtime path.

### Author bundled presets as checked JSX modules

Every bundled `src/themes/*.ts` preset manifest will move to `.jsx`.
`src/themes.ts` remains the typed catalog and continues importing the emitted
`.js` module paths, so runtime imports and published `lib/themes/*.js` paths stay
stable.

Each JSX manifest will use JSDoc `@satisfies` against the exported
`ThemeDefinition` contract. Repository TypeScript settings will include and
check only the repository-owned preset JSX sources, and the build configuration
will emit them as JavaScript beside the compiled registry. ESLint will cover
those source files as repository code. These settings compile yolojsx itself;
they are not generated for or required by users selecting local theme modules.

Keeping the files as unchecked copies was rejected because it would remove the
catalog's build-time shape checks. Publishing `.jsx` files was rejected because
the typed registry and Node runtime already consume stable `.js` package paths.

### Remove `--css`, retain normal CSS imports

The CLI option, path validator, build option, generated stylesheet import, help
text, tests, and documentation for `--css` will be deleted. An application that
still needs local CSS can import it from JSX/TSX, where Vite preserves
file-relative asset handling.

This avoids maintaining two competing customization contracts. Application CSS
imports are an escape hatch, not an additional theme manifest or guaranteed
post-theme cascade slot.

## Risks / Trade-offs

- **Theme loading runs trusted code at build time** → Document the trust
  boundary next to the CLI contract, matching the existing trusted JSX model.
- **A custom theme adds a small preliminary Vite build** → Re-export only the
  default value, keep the build in memory, and avoid caching until measured
  performance requires it.
- **Top-level side effects still run while obtaining the default export** →
  Document that theme modules should keep initialization deterministic; this is
  inherent to standard module evaluation.
- **Removing `--css` breaks existing scripts** → Emit a clear unknown-option
  error and document the direct CSS-import migration in README and changelog.
- **Validation errors currently assume catalog entries** → Wrap them with the
  custom source path while retaining the precise underlying field failure.
- **JSX preset manifests could lose TypeScript shape checks** → Apply JSDoc
  `@satisfies`, repository-scoped JavaScript checking, and the existing complete
  catalog validation.
- **Repository JSX settings could be mistaken for consumer requirements** →
  Scope them to bundled sources and document that custom themes still require
  no user configuration.

## Migration Plan

1. Add custom module resolution and validation while preserving every built-in
   preset and alias.
2. Remove `--css` in the same release and update CLI help, public docs, the
   official skill, specs, tests, and changelog together.
3. Migrate documented `--css styles.css` usage to `import "./styles.css"` from
   the application entry.
4. Rename bundled preset manifests to `.jsx`, retain their `.js` package paths,
   and update repository-only type, build, lint, registry, and fixture coverage.
5. Verify built-in and custom themes in default file, self-contained file, and
   directory output modes, including a zero-install fixture with named JSX
   components.

Rollback is a normal package-version rollback; build outputs remain
self-contained or directory artifacts and require no data migration.

## Open Questions

None.
