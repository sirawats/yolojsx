## Why

Building a small React page currently requires creating and configuring an entire frontend project before a single JSX component can be compiled. `yolojsx` should provide an open-source, zero-configuration CLI that turns one JSX component into a deployable static application with React, Vite, Tailwind CSS, and Ant Design already available.

## What Changes

- Add an npm-distributed CLI package named `yolojsx` with a `yolojsx` executable that works after global installation and through `npx yolojsx`.
- Accept a JSX entry file whose default export is a React component and build it into a deployable static application.
- Generate the HTML document, React mounting entry, and stylesheet entry required by the build without modifying the input project.
- Supply and consistently resolve React, Vite, Tailwind CSS, and Ant Design from the CLI package while preserving the input file's relative imports and locally installed non-core dependencies.
- Write output to `./dist` by default, support a caller-selected output directory and public base path, and protect unrelated files from destructive cleanup.
- Report validation and compilation failures with actionable messages and non-zero exit codes.

## Capabilities

### New Capabilities

- `jsx-app-build`: Defines the CLI invocation, JSX component contract, generated application shell, build behavior, output shape, and diagnostics.
- `bundled-frontend-stack`: Defines the zero-install React, Tailwind CSS, and Ant Design environment and dependency-resolution behavior.
- `safe-build-output`: Defines output path selection, managed-directory replacement, and safeguards for existing files.

### Modified Capabilities

None.

## Impact

- Introduces the initial Node.js/npm package, executable entry point, build orchestration, generated runtime shell, and automated tests.
- Adds runtime/build dependencies for React, React DOM, Vite, the React Vite integration, Tailwind CSS and its Vite integration, and Ant Design.
- Establishes a public CLI contract and a default-exported React component input contract.
- Produces static deployment artifacts in a user-selected local directory; it does not introduce hosted services or external runtime infrastructure.
