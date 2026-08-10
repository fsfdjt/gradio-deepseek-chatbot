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

test("docs folder contains a GitHub Pages compatible static build", () => {
  const docsIndex = read("docs/index.html");
  const docsMarker = statSync(new URL("../docs/.nojekyll", import.meta.url));
  const docsStyles = statSync(new URL("../docs/src/styles.css", import.meta.url));
  const docsApp = statSync(new URL("../docs/src/app.js", import.meta.url));
  const docsIcon = statSync(new URL("../docs/assets/favicon.svg", import.meta.url));

  assert.ok(docsMarker.isFile());
  assert.ok(docsStyles.isFile());
  assert.ok(docsApp.isFile());
  assert.ok(docsIcon.isFile());
  assert.match(docsIndex, /href="src\/styles.css"/);
  assert.match(docsIndex, /src="src\/app.js"/);
  assert.doesNotMatch(docsIndex, /background-flower\.mp4/);
});
