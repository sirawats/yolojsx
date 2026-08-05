## 1. Schema & Validation

- [x] 1.1 Add optional `css?: string` to `ThemeDefinition` and `Theme` interfaces in `src/themes.ts`.
- [x] 1.2 Update `validateThemeCatalog()` in `src/themes.ts` to validate that `css`, if provided, is a string.

## 2. Theme Runtime & CSS Pipeline

- [x] 2.1 Preserve `definition.css` when `createTheme()` converts a loaded definition into the runtime theme.
- [x] 2.2 Inject custom theme CSS into the generated theme stylesheet entry point during Vite build.

## 3. Foundation & Skill Updates

- [x] 3.1 Add compact inline `code` and `kbd` spacing to the shared foundation stylesheet.
- [x] 3.2 Update `skills/rtifact-create-theme/SKILL.md` and schema references to document the optional `css` field.

## 4. Verification & QA Test Plan

- [x] 4.1 UT-1 & UT-2: Add unit tests in `test/unit/themes.test.ts` for valid string CSS and non-string error throwing.
- [x] 4.2 IT-1 & IT-2: Integration test single-file (`--output`) and directory (`--out-dir dist`) builds with embedded theme CSS.
- [x] 4.3 IT-3 & IT-4: Verify CSS variable binding and malformed CSS build failure.
- [x] 4.4 IT-5: Verify build isolation and Tailwind source discovery for a named component exported by the selected theme module.
- [x] 4.5 Run `npm run verify` full gate (Prettier formatting, ESLint, TypeScript types, Unit/Integration test suites, Package packing).
