# Security policy

## Supported versions

Before the first npm release, security fixes are made on the default branch.
After publication, the latest release line will receive security fixes. Older
pre-1.0 releases may be addressed only through an upgrade to the newest patch or
minor release.

| Version                | Supported              |
| ---------------------- | ---------------------- |
| Default branch         | Yes                    |
| Latest npm release     | Yes, after publication |
| Older pre-1.0 releases | No guarantee           |

## Report a vulnerability

Use the repository's private vulnerability-reporting feature. Include:

- the affected version or commit;
- operating system and Node.js version;
- a concise impact description;
- minimal reproduction steps or a private proof of concept;
- whether the issue is already public; and
- any suggested mitigation.

Do not open a public issue with exploit details, credentials, private paths, or
an unpatched proof of concept. If private vulnerability reporting is not visible,
open a minimal public issue asking the maintainer to establish private contact,
without describing the vulnerability.

The repository owner must enable private vulnerability reporting before public
launch.

## Response targets

Maintainers aim to:

- acknowledge a report within five business days;
- complete initial triage within ten business days;
- keep the reporter informed when the status materially changes; and
- coordinate disclosure after a fix or mitigation is available.

These are targets, not a service-level guarantee.

## Security-sensitive areas

Reports are especially valuable for:

- output path validation or unintended deletion;
- symbolic-link, traversal, or staging/backup behavior;
- generated HTML script or resource injection;
- single-file payload validation and browser execution;
- dependency resolution that loads unintended local code; and
- npm package or release-workflow compromise.

The CLI intentionally treats the selected JSX entry and custom CSS as trusted
local code. Reports that require a user to build deliberately malicious local
source may be out of scope unless they cross a documented trust boundary.

## Coordinated disclosure

Please allow reasonable time to investigate and publish a correction before
public disclosure. Maintainers will credit reporters who request credit and will
avoid naming reporters who prefer privacy.
