import process from "node:process";
import { fileURLToPath } from "node:url";
import { run } from "./process.js";

const ALLOWED_BRANCH =
  /^(?:master|dependabot\/.+|(?:build|chore|ci|docs|feat|feature|fix|hotfix|perf|refactor|release|revert|style|test)\/[a-z0-9][a-z0-9._/-]*)$/;

export function isAllowedBranchName(branch) {
  return ALLOWED_BRANCH.test(branch);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const branch = run("git", ["branch", "--show-current"]).stdout.trim();

  if (!isAllowedBranchName(branch)) {
    process.stderr.write(
      `Invalid branch name "${branch}". Use master or type/lowercase-description.\n`,
    );
    process.exitCode = 1;
  }
}
