import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedBranchName } from "../../scripts/check-branch-name.js";

test("accepts repository branch names and rejects unstructured names", () => {
  for (const branch of [
    "master",
    "chore/non-functional",
    "feat/add-theme",
    "dependabot/npm_and_yarn/vite-9.0.0",
  ]) {
    assert.equal(isAllowedBranchName(branch), true, branch);
  }
  for (const branch of ["main", "new-feature", "feat/Uppercase"]) {
    assert.equal(isAllowedBranchName(branch), false, branch);
  }
});
