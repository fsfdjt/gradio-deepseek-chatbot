import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("GitHub Pages workflow deploys the current Vite app build", () => {
  const workflowPath = ".github/workflows/deploy-pages.yml";

  assert.equal(existsSync(workflowPath), true);

  const workflow = readFileSync(workflowPath, "utf8");

  assert.match(workflow, /codex\/work-life-hub/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /path:\s*dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
