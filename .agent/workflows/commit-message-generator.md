---
description: Generate a concise conventional commit message from staged changes
---

Generate a commit message from the current staged changes (`git diff --cached`).

**Steps**

1. **Read staged changes**

   Run `git diff --cached --stat` to get the summary, then `git diff --cached`
   for the full diff. If nothing is staged, tell the user and stop.

2. **Determine the commit type**

   Pick the single best type from the project's allowed set:

   | Type         | When to use                                        |
   | ------------ | -------------------------------------------------- |
   | `feat`       | New user-facing feature or capability               |
   | `fix`        | Bug fix                                             |
   | `docs`       | Documentation only (README, CHANGELOG, comments)    |
   | `style`      | Formatting, whitespace, lint fixes (no logic change) |
   | `refactor`   | Code restructuring without feature or fix            |
   | `perf`       | Performance improvement                             |
   | `test`       | Adding or updating tests                             |
   | `build`      | Build system, CI, dependencies, scripts              |
   | `chore`      | Maintenance that doesn't fit other types             |
   | `revert`     | Reverting a previous commit                          |
   | `ci`         | CI configuration only                                |

   If changes span multiple types, use the most significant one.

3. **Determine the scope (optional)**

   Add a scope in parentheses if the change is clearly scoped to one area.
   Examples: `themes`, `cli`, `website`, `ci`, `output`, `single-file`.
   Omit the scope if the change is broad or the type already implies it.

4. **Write the subject line**

   Rules (enforced by `@commitlint/config-conventional`):
   - Format: `type(scope): description` or `type: description`
   - **Maximum 100 characters total** for the entire subject line
   - Use lowercase for the entire subject line
   - Use imperative mood ("add", "fix", "update", not "added", "fixes")
   - Do not end with a period
   - Be specific: describe *what* changed, not *how*
   - Prefer shorter messages — aim for 50–72 characters when possible

5. **Present the message**

   Show the generated commit message to the user in a code block.
   Do NOT run `git commit` — let the user review and commit themselves.

**Examples of good messages**

```
feat(themes): add gruvbox and everforest theme families
fix(ci): normalize line endings for windows builds
build: add pre-commit hook for lint and format
docs: update ci behavior in agents.md
refactor(output): extract html validation into helper
test(single-file): cover compressed payload round-trip
style: apply prettier formatting to theme files
fix: resolve spawnSync EINVAL on windows
```

**Examples of bad messages**

```
update files                          ← too vague
Fix bug.                              ← period, capitalized, vague
feat: Added new feature for users     ← past tense, vague
refactor(themes)(cli): split modules  ← multiple scopes
```
