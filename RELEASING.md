# Releasing yolo-jsx

The package is pre-1.0. Treat the CLI, entry contract, and managed-output marker as public interfaces.

## Pre-release checklist

1. Recheck that the `yolo-jsx` package name is available with `npm view yolo-jsx`. It returned npm `E404` (not registered) on 2026-07-22, but availability can change at any time.
2. Confirm the installed Vite and `@vitejs/plugin-react` Node.js engine requirements still match the `engines.node` range in `package.json` and the runtime error message.
3. Run `npm install` without manually selecting uncertain versions, then review the resulting dependency ranges and lockfile.
4. Run `npm test`.
5. Build `examples/Home.jsx` and serve the generated directory with a static file server for a browser smoke test.
6. Run `yolojsx examples/Home.jsx --single-file`, confirm `Home.html` is created, and open it directly through `file://` in a browser with `DecompressionStream` support.
7. Run `yolojsx examples/Home.jsx --single-file --output index.html` and verify the explicit name replaces the basename default.
8. Run `yolojsx pack dist --output packed.html`, open it through `file://`, and confirm the source `dist/` tree is unchanged.
9. Run `npm pack --dry-run` and confirm only the bin, source, example, README, release guide, license, and package metadata are included, including the single-file runtime modules.
10. Install the generated tarball into an isolated prefix and test both `yolojsx --version` and `yolo-jsx --version`.
11. From the isolated installation, verify directory output, both direct single-file naming forms, and `yolojsx pack dist --output index.html`.
12. Exercise an npm-exec/npx-equivalent invocation against the packed tarball.
13. Confirm that no credentials, local output, temporary files, or unrelated OpenSpec artifacts are present in the tarball.
14. Publish with an explicit pre-1.0 version and verify the installed package can build and package the documented example.

If a release is broken, deprecate the affected version, restore the previous dist-tag, and publish a corrected patch version. Avoid unpublishing unless npm policy and the short post-publication window make it necessary.
