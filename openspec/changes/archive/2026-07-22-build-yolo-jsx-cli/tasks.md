## 1. Package Foundation

- [x] 1.1 Initialize the ESM npm package with `yolo-jsx` metadata, `yolojsx` and `yolo-jsx` bin mappings, published-file allowlist, license, and the supported Node.js engine range.
- [x] 1.2 Add a maintainable source layout for CLI parsing, build orchestration, dependency resolution, generated templates, output management, and errors.
- [x] 1.3 Add compatible pinned ranges for Vite, its React integration, React, React DOM, Tailwind CSS and its Vite integration, and Ant Design.
- [x] 1.4 Configure unit and integration test commands that run against isolated temporary fixtures.

## 2. CLI Contract and Validation

- [x] 2.1 Implement the positional JSX entry plus `-o`/`--out-dir`, `--base`, `--force`, help, and version options with documented defaults.
- [x] 2.2 Resolve CLI paths from the invocation working directory and validate that the entry is an existing readable `.jsx` file.
- [x] 2.3 Check the running Node.js version against the declared engine range and return actionable non-zero failures for invalid invocation or unsupported runtimes.
- [x] 2.4 Normalize CLI success and failure reporting so build errors retain original source paths and successful builds report the resolved output directory.

## 3. Generated React Application Build

- [x] 3.1 Implement lifecycle-safe temporary workspace creation and cleanup without writing generated files into the input source tree.
- [x] 3.2 Generate the HTML root, stylesheet entry, and virtual React mount module that imports the original JSX entry by normalized absolute path.
- [x] 3.3 Invoke Vite's JavaScript build API with controlled inline configuration, `configFile: false`, the generated HTML entry, and relative default base handling.
- [x] 3.4 Preserve relative source-module and asset resolution and implement the custom `--base` behavior in production output.
- [x] 3.5 Translate missing or unusable default exports, syntax failures, and unresolved imports into actionable CLI failures while preserving Vite diagnostic details.

## 4. Bundled Frontend Stack

- [x] 4.1 Resolve React, React DOM, and Ant Design imports to package-owned dependency instances in global-install and `npx`-style layouts and deduplicate React.
- [x] 4.2 Preserve input-project resolution for non-core bare imports and report the importing file when a user dependency is missing.
- [x] 4.3 Integrate Tailwind CSS into the generated build and configure source discovery for the JSX entry and nested local source modules outside the temporary root.
- [x] 4.4 Establish and document the generated Tailwind and Ant Design style ordering, including compatible handling of Tailwind preflight.

## 5. Safe Output Management

- [x] 5.1 Resolve the default `<cwd>/dist` and custom output paths and reject filesystem roots, the working directory, and directories containing the source entry.
- [x] 5.2 Define and validate a `yolo-jsx` ownership marker that distinguishes managed output from unrelated non-empty directories.
- [x] 5.3 Stage builds separately and replace managed output only after compilation succeeds so a failed rebuild preserves the last successful output.
- [x] 5.4 Refuse unowned non-empty output by default and implement clearly reported `--force` replacement without weakening dangerous-path guards.

## 6. Automated Verification

- [x] 6.1 Add an end-to-end fixture proving a standalone JSX component builds to working `index.html`, JavaScript, and CSS output without local React dependencies.
- [x] 6.2 Add fixtures for relative components and assets, custom base paths, locally installed non-core dependencies, and isolation from an unrelated `vite.config.*`.
- [x] 6.3 Add integration coverage proving Ant Design components and Tailwind utilities in both the entry and imported local components are included together.
- [x] 6.4 Add failure tests for missing arguments, invalid paths and extensions, JSX syntax errors, missing default exports, and unresolved user dependencies.
- [x] 6.5 Add output-safety tests for initial builds, managed rebuilds, unowned directories, forced replacement, dangerous paths, cleanup, and preservation after failed rebuilds.
- [x] 6.6 Pack the npm tarball and smoke-test both global-bin-equivalent and `npx`-equivalent invocation layouts to catch package-resolution or missing-file failures.

## 7. Open-Source Release Readiness

- [x] 7.1 Write the README with installation, global and `npx` examples, component contract, CLI options, output behavior, supplied dependencies, and current limitations.
- [x] 7.2 Add a minimal example component demonstrating Tailwind CSS and Ant Design in one build.
- [x] 7.3 Verify the npm package name, review packed tarball contents, run the full test suite, and document the pre-1.0 publishing checklist.
