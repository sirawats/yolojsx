## Context

The current name appears across the public CLI contract, npm metadata, JSX metadata, generated HTML, filesystem ownership markers, themes, plugins, official skills, examples, tests, documentation, repository URLs, and visual assets. A blind text replacement would miss name-bearing paths and could weaken output safety, while retaining broad compatibility aliases would defeat the discoverability goal and leave two product identities to maintain.

Rtifact is both the new brand and the product model: agents author compact React JSX, and Rtifact turns it into a finished, portable, interactive HTML artifact. The default one-file output remains the primary workflow; self-contained offline files and deployable asset directories remain first-class modes.

## Goals / Non-Goals

**Goals:**

- Establish one consistent brand: **Rtifact** in prose, `rtifact` for package/CLI/plugin/skill identifiers, `RTIFACT` for JSX metadata, and `Rtifact*` for code symbols.
- Remove the old YOLO-derived identity from every active product surface and name-bearing path while preserving OpenSpec change records as history.
- Make the artifact outcome—not frontend scaffolding—the lead explanation in documentation, website copy, plugin descriptions, and official skills.
- Preserve existing build behavior, output modes, dependency integration, accessibility guidance, filesystem validation, and publication checks under the new identity.
- Leave the repository apply-ready with focused automated checks that catch incomplete renames.

**Non-Goals:**

- Changing the supported JSX/TSX application shape, supplied frontend stack, themes, output formats, or CLI options.
- Maintaining an old executable, package, metadata-export, plugin, or skill alias in this repository.
- Editing completed OpenSpec archives or generated/untracked build output.
- Performing npm publication, GitHub repository renaming, Pages migration, or marketplace updates that require external account state.
- Designing a complex replacement logo; a typographic Rtifact identity is sufficient for this change.

## Decisions

### Use one casing and identifier map

Public prose uses **Rtifact**. Machine identifiers use `rtifact`; the optional entry metadata export becomes `RTIFACT`; exported TypeScript symbols use `Rtifact`, such as `RtifactError`. Generated IDs, virtual modules, data attributes, temporary directories, and ownership files use lowercase `rtifact` forms. This mechanical map makes residual old-name searches meaningful and avoids one-off spellings.

Alternative considered: keep the lowercase wordmark everywhere. Rejected because the capital R communicates the React-plus-artifact construction while lowercase remains natural for commands and package IDs.

### Make a clean public break

The package exposes only the `rtifact` executable, examples export only `RTIFACT`, and official plugins and skills use only Rtifact identifiers. No compatibility alias is added for the old CLI, metadata export, or integration IDs. The project is early enough that one coordinated rename is smaller and clearer than maintaining parallel brands.

Alternative considered: retain deprecated aliases. Rejected because aliases would keep the collision searchable, complicate skills and tests, and contradict the requested complete replacement.

### Preserve filesystem safety through the existing unowned-output path

New directory builds write `.rtifact-output.json`. A directory containing only the old marker is not considered Rtifact-managed, so it follows the existing unowned-directory confirmation or `--force` flow. This avoids retaining an old brand identifier in runtime code without permitting silent deletion.

Alternative considered: recognize both marker names. Rejected because it leaves a permanent old-name compatibility branch; treating the directory as unowned is already safe and requires no new mechanism.

### Treat artifact-first messaging as a product contract

The canonical positioning is: “Rtifact turns agent-authored JSX into portable, interactive HTML artifacts.” Explanations lead with the finished, shareable result; then explain JSX as the agent-authored source and the supplied React, Ant Design, Tailwind CSS, React Icons, and PrismJS stack as implementation support. Skills teach agents to start from the artifact's audience, information, and action, and to verify the rendered artifact rather than optimize source aesthetics.

Alternative considered: perform a name-only copy edit. Rejected because it would preserve the current ambiguity between a frontend scaffolder and an artifact-producing tool.

### Use repository-native rename and verification tools

Implementation begins with `rg` inventories and `git mv` for tracked name-bearing paths, followed by focused content edits and formatting. Completion requires a residual-name scan outside completed OpenSpec archives, exact example/skill mirroring, targeted tests for renamed public contracts, and `npm run verify`.

Alternative considered: an unchecked global substitution. Rejected because case mapping is semantic and paths, generated identifiers, URLs, prose, and historical exclusions require different treatment.

## Risks / Trade-offs

- **Breaking existing commands and metadata exports** → Mark the change breaking in the changelog and record the exact identifier migration in this OpenSpec change.
- **Old managed output directories are no longer recognized** → Preserve data through the existing unowned-output prompt and non-interactive refusal; document that users can confirm or pass `--force` for an intentional rebuild.
- **External names may not be renamed atomically with the repository** → Keep publication as an explicit release checklist and update canonical URLs immediately before release.
- **Mechanical replacement can alter historical records or third-party text** → Exclude completed OpenSpec archives, inspect notices and license text semantically, and run a scoped residual-name report.
- **Removing the Chihuahua leaves no graphical logo** → Use a text wordmark for the initial rebrand; add a dedicated visual identity only when the product needs one.

## Migration Plan

1. Rename tracked skill/plugin paths and the brand asset boundary with `git mv`; remove the old graphical asset if no replacement is required.
2. Rename package/bin metadata, public CLI and JSX metadata contracts, generated identifiers, internal symbols, markers, fixtures, and tests.
3. Update active main specs, examples and their exact skill copies, manifests, website, README, product and maintainer documentation, notices, release guidance, and changelog with artifact-first language.
4. Run focused unit/integration/package checks, a residual old-name scan excluding OpenSpec change records, and `npm run verify`.
5. Before publishing, rename or create the GitHub repository and Pages target, confirm the npm and marketplace identifiers, update external listings, publish Rtifact, and deprecate the old npm package externally if desired.

Rollback before publication is a normal revert of the coordinated repository change. After publication, restore the previous release only if necessary while keeping the Rtifact package reserved and publishing corrected migration guidance.

## Open Questions

No repository-level decisions remain. External package, repository, Pages, and marketplace availability must be confirmed by the maintainer during release.
