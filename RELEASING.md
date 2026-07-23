# Releasing yolo-jsx

The package is pre-1.0. Treat the CLI, output defaults, theme ids, semantic CSS
variables, and managed-output marker as public interfaces.

## Pre-release checklist

1. Recheck npm package-name availability and current dependency/Node engine compatibility.
2. Run a clean `npm install`, review dependency and lockfile changes, then run `npm run verify`.
3. Confirm `yolojsx examples/Home.jsx` creates `Home.html`; open it through `file://` in a browser with gzip `DecompressionStream` support.
4. Run `yolojsx examples/Home.jsx --out-dir dist`, serve it, and verify Tailwind utilities, global theme styles, and Ant Design components.
5. Exercise an unsuffixed light alias such as `--theme material`, its explicit `material-dark` counterpart, the `onedark` alias, and `--css` with a relative local image or font in both modes; confirm system color preference never changes the selected theme.
6. Run `yolojsx themes` and compare every id, light alias, fixed mode, description, revision, and license with `src/themes/`, `src/themes.js`, and `THIRD_PARTY_NOTICES.md`.
7. Confirm all stored theme CSS is original yolojsx code: no upstream/Obsidian selectors or stylesheet blocks, no downloaded fonts/assets, and no endorsement claims.
8. Review automated contrast results for text, muted text, primary controls, focus, selection, and status pairs.
9. Verify the stable `theme, base, antd, components, utilities` cascade, Tailwind Preflight, and the absence of Ant Design reset CSS.
10. Test existing file and directory targets with `no`, `yes`, non-interactive input, and `--force`; confirm failed rebuilds preserve prior output.
11. Verify `--single-file` still builds with a deprecation warning, and `--out-dir dist` is documented as the old-default migration.
12. Run `yolojsx pack dist --output packed.html` and confirm `dist/` is unchanged; exercise a rejected graph and check its directory-mode recommendation.
13. Run `npm pack --dry-run`. Confirm the tarball includes `src/themes/*.css`, `THIRD_PARTY_NOTICES.md`, and no output, temporary files, credentials, or unrelated artifacts.
14. Review the default themed/provider artifact size reported by `npm run verify:package`; investigate before increasing its 1,000,000-byte release budget.
15. Install the tarball into an isolated prefix and test both executable names plus a global-bin and npm-exec/npx-equivalent layout.
16. Publish with an explicit pre-1.0 version, then verify the installed package can build the documented example in both output modes.

If a release is broken, deprecate the affected version, restore the previous
dist-tag, and publish a corrected patch version. Avoid unpublishing unless npm
policy and the short post-publication window make it necessary.
