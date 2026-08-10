import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("GitHub Pages workflow deploys the static site from the product branch", () => {
  const workflow = read(".github/workflows/pages.yml");

  assert.match(workflow, /branches:\s*\n\s+- life-receipt-machine/);
  assert.match(workflow, /uses: actions\/configure-pages@v5/);
  assert.match(workflow, /uses: actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
  assert.match(workflow, /path: \./);
});

test("GitHub Pages skips Jekyll processing for static assets", () => {
  const marker = statSync(new URL("../.nojekyll", import.meta.url));

  assert.ok(marker.isFile());
});
