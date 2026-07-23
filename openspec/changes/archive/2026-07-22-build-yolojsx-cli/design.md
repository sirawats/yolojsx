## Context

The repository contains only an OpenSpec configuration and has no existing application or package architecture. The first release must establish both the npm package contract and the build pipeline.

The intended user may have only a JSX file, so the CLI cannot assume that a Vite project, HTML entry, stylesheet, configuration file, or local copies of the advertised frontend dependencies exist. At the same time, imports relative to the input file must continue to behave as if they were built from their original location.

Vite exposes a programmatic build API using inline configuration and treats HTML as an application entry. Tailwind CSS requires visibility into user-authored source files to generate used utilities. A globally installed Node CLI also cannot rely on ordinary bare-import resolution from the user's file to find dependencies installed under the CLI package.

## Goals / Non-Goals

**Goals:**

- Compile one default-exported JSX React component into a deployable static application with one command.
- Work from both a global npm installation and `npx` without requiring a project-local frontend setup.
- Preserve relative imports, assets referenced by the module graph, and locally installed non-core dependencies.
- Provide React, Tailwind CSS, and Ant Design from one controlled dependency graph.
- Keep the build isolated from unrelated Vite configuration and avoid modifying the source project.
- Make repeated builds convenient while protecting unrelated output directories from destructive cleanup.

**Non-Goals:**

- Development server, hot module replacement, or watch mode.
- SSR, library-mode bundles, multiple pages, or a user-supplied HTML template.
- TypeScript type checking or an initial guarantee for TSX inputs.
- Supporting arbitrary overrides of the internal Vite configuration.
- Bundling arbitrary third-party dependencies that are not part of the advertised stack.

## Decisions

### Package and command contract

Publish the package as `yolojsx` and expose `yolojsx` as its `bin`. Global users run `yolojsx Home.jsx`; one-off users run `npx yolojsx Home.jsx`.

The CLI accepts one positional entry, `-o`/`--out-dir`, `--base`, and `--force`. Paths are resolved from the caller's current working directory. The package declares the minimum Node.js version required by the selected supported Vite release.

Alternatives considered:

- Using the same `yolojsx` name for the package and executable keeps global and `npx` invocation symmetrical.
- Exposing Vite's full CLI option surface would reduce implementation work but would make the supposedly zero-configuration contract unstable and harder to support.

### Build a generated application shell through Vite's JavaScript API

The CLI creates a temporary workspace containing an HTML entry and generated CSS entry. A small Vite plugin provides a virtual React module that imports the original entry by normalized absolute path and mounts its default export with React DOM. The CLI invokes Vite's `build()` with inline configuration and `configFile: false`, then removes the temporary workspace.

The build uses `./` as its default public base so the generated directory remains portable when hosted at a subpath. `--base` allows deployment-specific overrides.

Alternatives considered:

- Copying the user entry into a template project would break relative imports or require recursively recreating the source tree.
- Maintaining a permanent hidden project in the caller's directory would pollute the source tree and complicate cleanup.
- Invoking the Vite executable as a subprocess would make structured errors, configuration isolation, and tests less reliable than the JavaScript API.

### Require a default-exported React component

The initial input contract is a `.jsx` module whose default export is a renderable React component. The generated mount module creates a root element and renders that component. It does not infer whether a module exports an element or mounts itself.

This intentionally narrow contract provides deterministic behavior and clear errors. Additional entry modes or TSX transpilation can be added later as explicit capabilities.

### Resolve advertised dependencies from the CLI package

The inline Vite configuration or an internal resolver plugin maps core stack imports to the dependency instances owned by `yolojsx`, including React, React DOM, and Ant Design. React-related packages are deduplicated so the generated shell and user component cannot load separate React instances.

Relative imports remain anchored to the original input module. Bare imports outside the advertised stack resolve from the input project's context and fail with a normal actionable build error if they are not installed there. This creates a clear boundary between the self-contained stack and user-selected dependencies.

Alternatives considered:

- Preferring arbitrary user-installed versions of React or Ant Design undermines zero-configuration reproducibility and can create duplicate-React failures.
- Bundling every import from the CLI context is impossible because the CLI cannot predict user dependencies.

### Generate Tailwind styles from the input source tree

The temporary application imports a generated Tailwind stylesheet and uses Tailwind's Vite integration. Source discovery is configured to cover the input module and local source files reachable under its source directory, even though they live outside the temporary Vite root. It excludes dependency and output directories to avoid unnecessary scanning.

The generated stylesheet and Ant Design styles must be tested together with representative utilities and components. The implementation will use a stable, documented ordering that preserves Tailwind utilities without unexpectedly degrading Ant Design component styling.

### Track ownership of generated output

The default output is `<cwd>/dist`. A successful build writes a small ownership marker or manifest into the output. Later builds may clean and replace an output directory carrying a valid marker.

The CLI refuses to empty a non-empty, unowned output directory unless `--force` is supplied. It also rejects dangerous output targets such as the current working directory or filesystem roots, even with implicit defaults. Path validation occurs before Vite is invoked.

The build is staged before replacing managed output where practical, reducing the chance that a failed compilation destroys the last successful build.

## Risks / Trade-offs

- **Tailwind source scanning could miss imported files outside the selected source boundary** → Cover nested local modules in integration fixtures, document the boundary, and design the scanner configuration for later explicit source options.
- **Tailwind preflight and Ant Design styles can interact** → Pin compatible dependency versions and add visual-style assertions for representative Ant Design components and Tailwind utilities.
- **Global dependency resolution differs across npm clients and platforms** → Resolve package-owned dependencies using URLs derived from the installed CLI module rather than hard-coded `node_modules` paths; test global-style and `npx` package layouts.
- **A forced output path can contain valuable files** → Retain hard guards for filesystem roots and source inputs, clearly label `--force`, and test refusal behavior before any deletion occurs.
- **A user module can execute arbitrary build-time plugin or import side effects** → Do not advertise the CLI as a sandbox; document that inputs are trusted local code.
- **Bundled frontend dependencies increase package size** → Accept this cost for the zero-install promise and keep optional tools out of the first release.

## Migration Plan

This is the initial release, so there is no compatibility migration. Implementation can be released first as a pre-1.0 version, exercised with packed-package and `npx`-equivalent smoke tests, and then published once the registry name and supported Node.js range are confirmed. Rollback consists of unpublishing or deprecating the affected pre-1.0 release and restoring the previous package tag.

## Open Questions

- Confirm that the `yolojsx` npm package name is available before publishing.
- Decide whether `@ant-design/icons` belongs in the guaranteed stack or remains a separately installed user dependency.
- Decide whether a conventional `public/` directory beside the input should be copied automatically or introduced later through an explicit option.
