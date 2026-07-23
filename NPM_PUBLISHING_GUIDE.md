# Publishing yolojsx to npm for the first time

This guide is for a maintainer who has never distributed a Node.js package.
It explains what npm publishing changes, which commands are safe to practice,
and how to release `yolojsx` without accidentally replacing or exposing
anything.

Read [RELEASING.md](RELEASING.md) and complete
[OPEN_SOURCE_CHECKLIST.md](OPEN_SOURCE_CHECKLIST.md) alongside this guide.

## The one rule to remember

Most commands in this guide only inspect, test, or package the project. The
following command is different:

```sh
npm publish
```

Without `--dry-run`, it uploads a public package version to the npm registry.
Published versions are effectively immutable: npm will not let you replace
`0.1.0` with different files later. Stop and review everything before running a
live publish command.

This guide labels the live command clearly. Do not run it merely to see what it
does; use `npm publish --dry-run` for practice.

## Four npm concepts

1. **Package**: the project name in `package.json`, which is `yolojsx`.
2. **Version**: an immutable snapshot such as `0.1.0`.
3. **Dist-tag**: a movable label that points to a version. Installing
   `yolojsx` normally uses the version tagged `latest`.
4. **Registry**: the server receiving the package. This project explicitly
   targets `https://registry.npmjs.org/`.

The GitHub repository and npm package are related but separate. Pushing code to
GitHub does not publish it to npm, and publishing to npm does not create a
GitHub release.

## What this project publishes

The `files` field in `package.json` is an allowlist. It includes runtime source,
the executable, examples, and selected documentation. It excludes tests,
repository automation, local agent configuration, dependencies, generated
output, and temporary files.

The executable mapping is:

```json
{
  "bin": {
    "yolojsx": "bin/yolojsx.js"
  }
}
```

After installation, npm creates the `yolojsx` command from that entry.

Never add credentials, tokens, recovery codes, `.npmrc`, generated HTML,
`node_modules`, or private information to the published-file allowlist.

## Step 1: Prepare the npm account

Create or sign in to the intended account on
[npmjs.com](https://www.npmjs.com/). Verify its email address and store its
recovery information somewhere secure.

Enable strong two-factor authentication. npm currently supports:

```sh
npm profile enable-2fa auth-and-writes
```

The npm website can also configure 2FA. Protect both the npm account and its
email account. Never put an npm password, one-time password, recovery code, or
access token in this repository, an issue, a chat message, or a terminal
command that will be saved in shell history.

For an initial interactive release, authenticate locally:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

The second command must print the intended maintainer account, currently
`sirawats`. If it prints another account, stop and log out before continuing:

```sh
npm logout --registry=https://registry.npmjs.org/
```

For later releases, prefer npm trusted publishing from a protected GitHub
Actions environment. Trusted publishing uses short-lived identity credentials
instead of storing a long-lived npm write token. Set that up only after
confirming the repository, workflow filename, npm package, and protected
environment that should be trusted.

## Step 2: Understand the version

This project uses semantic versions:

```text
MAJOR.MINOR.PATCH
  0  .  1  .  0
```

- Increase `PATCH` for a compatible bug fix: `0.1.0` to `0.1.1`.
- Increase `MINOR` for new compatible behavior: `0.1.0` to `0.2.0`.
- Increase `MAJOR` for a stable package's incompatible public behavior.
- While the major version is `0`, treat incompatible changes carefully and
  describe them clearly because users may still rely on the current behavior.

Every npm version can be published only once. Check the registry before a
release:

```sh
npm view yolojsx versions --json
```

An `E404` response is expected before the package's first publication. After
the first release, confirm that the version in `package.json` is absent from the
returned list.

For a later patch release, this command updates `package.json` and
`package-lock.json` without creating a Git commit or tag:

```sh
npm version patch --no-git-tag-version
```

Use `minor` or `major` only when that matches the release. Update
`CHANGELOG.md` with the same version and release date.

## Step 3: Prepare a release candidate

Work from the repository root. Confirm the current branch and changes:

```sh
git status
git diff --check
```

Before approval, the intended release should be committed, pushed to GitHub,
and passing CI. Do not release unrelated local changes.

Install exactly the locked dependencies in a clean checkout:

```sh
npm ci
```

Then run the project gates:

```sh
npm audit
npm run readiness
npm run verify
```

For `yolojsx`, `npm run verify` runs all tests, syntax checks, package-content
inspection, and smoke tests against an extracted package. The
`prepublishOnly` lifecycle runs verification and readiness again before npm is
allowed to publish.

Do not bypass a failing gate with `--ignore-scripts`. Fix the failure or stop
the release.

## Step 4: Inspect the package without publishing

Preview the exact file list:

```sh
npm pack --dry-run
```

Check that the output says:

- package name `yolojsx`;
- the intended version;
- executable `bin/yolojsx.js`;
- expected source, themes, examples, license, notices, and documentation;
- no `.npmrc`, credentials, tests, generated HTML, `dist/`, or `node_modules`.

Next, exercise npm's complete publish lifecycle without uploading:

```sh
npm publish --dry-run --access public --tag latest
```

The final output should contain wording similar to:

```text
Publishing to https://registry.npmjs.org/ with tag latest ... (dry-run)
+ yolojsx@0.1.0
```

The `(dry-run)` text is essential. This command is safe to repeat because npm
does not upload the package.

For extra inspection, `npm pack` without `--dry-run` creates a local `.tgz`
archive:

```sh
npm pack
tar -tzf yolojsx-0.1.0.tgz
```

The archive is generated output. Inspect it, then remove it before committing.
Do not edit the archive; fix the source package and create it again.

## Step 5: Obtain approval

Record the release candidate before publishing:

```text
Version:
Commit SHA:
Git tag to create:
Registry: https://registry.npmjs.org/
Dist-tag: latest
Maintainer:
Reviewer:
Date:
```

At minimum, confirm:

- the Git working tree is clean;
- the release commit is pushed and CI is green;
- the version and changelog agree;
- the registry does not already contain that version;
- the dry-run tarball contains only intended files;
- the package license and third-party notices were reviewed;
- npm shows the intended account;
- the maintainer deliberately approves a public release.

Pause here if any item is uncertain.

## Step 6: Publish the first version

The following is the **live, irreversible publication step**:

```sh
npm publish --access public --tag latest
```

Run it once, from the reviewed release commit, while authenticated as the
intended maintainer. npm may request a one-time password or security-key
confirmation. The package is unscoped and public; `--access public` makes that
intent explicit. `--tag latest` makes the installation default explicit.

Do not add `--force`, do not use `--ignore-scripts`, and do not rerun the command
after an ambiguous failure until checking the registry:

```sh
npm view yolojsx@0.1.0
```

If the version is visible, the publication succeeded even if the terminal
connection ended before printing a success message.

## Step 7: Verify the public package

Inspect registry metadata:

```sh
npm view yolojsx@0.1.0
npm view yolojsx@0.1.0 bin engines repository license dist-tags
npm dist-tag ls yolojsx
```

Create a new empty directory outside this repository and test the public
package:

```sh
npm init -y
npm install yolojsx@0.1.0
npx yolojsx --version
npx yolojsx themes
```

Copy the documented `Home.jsx` example into that directory and test both output
modes:

```sh
npx yolojsx Home.jsx
npx yolojsx Home.jsx --out-dir dist
```

Open the generated HTML and serve the directory build as described in
`RELEASING.md`. Also inspect the package page on npmjs.com for correct README,
license, repository, issue, and provenance information.

Only after registry installation and smoke tests pass should you create the
matching signed Git tag, GitHub release, and announcement.

## Publishing later releases

For every later release:

1. Choose a new version; never reuse an existing one.
2. Move completed changelog entries from `Unreleased` into that version.
3. Run the same clean install, audit, readiness, verification, and dry run.
4. Review and approve the exact tarball.
5. Publish once.
6. Install that exact version from npm and smoke-test it.

Users receive `latest` by default:

```sh
npm install yolojsx
```

Use a non-default tag such as `next` for a prerelease:

```sh
npm version prerelease --preid=beta --no-git-tag-version
npm publish --access public --tag next
```

That live command publishes the prerelease but does not move `latest`. Users
must opt in with:

```sh
npm install yolojsx@next
```

Inspect or deliberately change tags with:

```sh
npm dist-tag ls yolojsx
npm dist-tag add yolojsx@0.1.1 latest
```

Changing a dist-tag does not change package files; it changes which already
published version the label selects.

## If something goes wrong

### Before publishing

Nothing is public yet. Fix the source, tests, metadata, version, or changelog
and repeat all dry-run checks.

### The version already exists

Do not try to overwrite it. Choose a new patch version, document the correction,
and publish that new version.

### A published version is broken

Publish a corrected patch version and move the appropriate dist-tag. Warn users
about the bad version:

```sh
npm deprecate yolojsx@0.1.0 "Use 0.1.1; 0.1.0 has a known release issue."
```

Deprecation leaves the version installable but displays the warning. Avoid
unpublishing except for urgent security, privacy, legal, or policy reasons after
reviewing npm's current unpublish policy. Removing versions can break users and
dependent packages.

### Credentials may have leaked

Stop the release. Revoke or rotate the credential in npm immediately, review
account sessions and package access, scan Git history, and follow
`SECURITY.md`. Deleting a token from the latest commit does not remove it from
Git history.

### Common errors

- `ENEEDAUTH`: run `npm login`, then verify with `npm whoami`.
- `E404` before the first release: the package name is not registered yet.
- `E403`: check account ownership, verified email, 2FA, access, and package-name
  rights.
- Version conflict: that immutable version already exists; bump the version.
- Lifecycle script failure: fix the failing readiness or verification command;
  do not bypass it.

## First-release command card

Everything in this block is non-publishing:

```sh
npm whoami --registry=https://registry.npmjs.org/
npm view yolojsx versions --json
git status
git diff --check
npm ci
npm audit
npm run readiness
npm run verify
npm pack --dry-run
npm publish --dry-run --access public --tag latest
```

After those commands pass, stop and obtain explicit release approval. The live
publish command is intentionally excluded from the copy-and-paste block.

## Official npm references

Recheck npm's current documentation before a release, especially when account
security or registry policy may have changed:

- [Creating and publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
- [Configuring two-factor authentication](https://docs.npmjs.com/configuring-two-factor-authentication)
- [Trusted publishing](https://docs.npmjs.com/trusted-publishers)
- [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements)
- [npm unpublish policy](https://docs.npmjs.com/policies/unpublish)
