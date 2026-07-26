# Publishing yolojsx to npm

`yolojsx` publishes through GitHub Actions and npm trusted publishing.

> [!IMPORTANT]
> Merging a pull request does not publish to npm. Publishing a non-prerelease
> GitHub Release starts the npm workflow.

Read [RELEASING.md](../../RELEASING.md) before preparing a release. For the
first public release only, also complete the
[first-public-release checklist](first-public-release.md).

## Release a version

### CD setup (one time)

#### npmjs.com

Configure the `yolojsx` package's trusted publisher:

| Field                | Value          |
| -------------------- | -------------- |
| Provider             | GitHub Actions |
| Organization or user | `sirawats`     |
| Repository           | `yolojsx`      |
| Workflow             | `publish.yml`  |
| Environment          | `npm`          |
| Permission           | `npm publish`  |

The values must match `.github/workflows/publish.yml` exactly. npm validates
them only when a publish is attempted. Protect the npm account and its email
account with two-factor authentication.

#### GitHub

Create the `npm` environment under **Settings → Environments**:

- leave required reviewers, wait timers, secrets, and variables empty;
- restrict deployments to tags matching `v*`.

Do not create an `NPM_TOKEN` secret. The workflow uses short-lived OIDC
credentials and publishes provenance. Publishing the GitHub Release is the solo
maintainer's manual approval.

Never put passwords, tokens, one-time passwords, recovery codes, or
authenticated-page HTML in the repository, issues, or chat.

### 1. Prepare the version

Start from an up-to-date branch. Choose the correct semantic version change:

```sh
npm version patch --no-git-tag-version
```

Use `minor` or `major` instead of `patch` when appropriate. The command updates
the package manifests and synchronizes plugin manifests without committing or
tagging.

Move the completed `CHANGELOG.md` entries from `Unreleased` to the new version
and date.

Set the version for the remaining commands:

```sh
VERSION="$(node -p "require('./package.json').version")"
echo "$VERSION"
```

Every npm version is immutable. Confirm this version does not already exist:

```sh
npm view yolojsx versions --json
```

### 2. Verify the release candidate

Run:

```sh
npm ci
npm audit
npm run readiness
npm run verify
npm publish --dry-run --access public --tag latest
```

The dry run must show the intended version and end with `(dry-run)`. Review its
file list for the executable, runtime source, themes, examples, license, and
notices. It must not contain credentials, `.npmrc`, generated HTML, `dist/`,
tests, or `node_modules`.

Fix any failure. Never bypass lifecycle scripts with `--ignore-scripts`.

### 3. Merge the release candidate

Commit the version, changelog, and manifest changes. Open and merge the pull
request, then wait for CI on `master` to pass.

The merge still does not publish the package.

### 4. Publish the GitHub Release

Open **GitHub → Releases → Draft a new release**:

1. Create or select tag `v<version>`, such as `v0.1.3`.
2. Target the release commit on `master`.
3. Use the version as the title.
4. Leave **Set as a pre-release** unchecked.
5. Publish the release.

The tag must equal `v` plus the version in `package.json`. The workflow rejects
a mismatch and skips prereleases.

### 5. Watch the publish workflow

Open **GitHub → Actions → Publish npm package**. The workflow:

1. checks that the release tag matches `package.json`;
2. installs locked dependencies;
3. reruns verification and readiness through `prepublishOnly`;
4. publishes the public package with the `latest` dist-tag and provenance.

Do not retry an ambiguous failure until checking whether the version reached
npm:

```sh
npm view "yolojsx@$VERSION"
```

### 6. Verify npm

After the workflow succeeds:

```sh
npm view "yolojsx@$VERSION"
npm view yolojsx dist-tags
```

Then test a clean registry installation outside this repository:

```sh
npm install "yolojsx@$VERSION"
npx yolojsx --version
npx yolojsx themes
```

The package page should show the new version, repository, license, README, and
provenance.

## Troubleshooting

### npm still shows the old version after a merge

Expected: merges run CI, not the publish workflow. Publish the matching
non-prerelease GitHub Release.

### The publish workflow did not start

Confirm that:

- the release is published, not draft;
- the release is not marked as a prerelease;
- `publish.yml` exists on the default branch;
- the release tag matches `v*`.

### `Check release version` failed

The GitHub tag and `package.json` differ. Do not move a published release tag;
prepare a correct new release.

### The job is blocked at the `npm` environment

Confirm the environment allows the release's `v*` tag and has no reviewer or
timer configured.

### npm reports `ENEEDAUTH`

Confirm the trusted publisher values exactly match:

- `sirawats/yolojsx`;
- `publish.yml`;
- environment `npm`;
- permission `npm publish`.

Also confirm the workflow uses a GitHub-hosted runner and grants
`id-token: write`.

### npm reports that the version already exists

Published versions cannot be replaced. Bump to a new patch version and release
that version.

### A published version is broken

Publish a corrected patch version. Deprecate the broken version when users need
a warning:

```sh
npm deprecate "yolojsx@<broken-version>" \
  "Use <fixed-version>; this version has a known issue."
```

Avoid unpublishing unless required for an urgent security, privacy, legal, or
policy issue.

## References

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub release events](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#release)
- [npm unpublish policy](https://docs.npmjs.com/policies/unpublish)
