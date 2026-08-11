import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { themeChoices } from "../src/lib/theme.ts";

test("theme system exposes multiple selectable skins", () => {
  assert.deepEqual(
    themeChoices.map((choice) => choice.id),
    ["glass", "ocean", "forest", "sunset", "midnight"],
  );
});

test("settings page wires theme selection to app state", () => {
  const source = readFileSync("src/App.tsx", "utf8");

  assert.match(source, /loadTheme/);
  assert.match(source, /saveTheme/);
  assert.match(source, /applyTheme/);
  assert.match(source, /themeChoices\.map/);
  assert.match(source, /onSelectTheme/);
  assert.match(source, /主题皮肤/);
});

test("theme CSS uses data-theme variables and selectable options", () => {
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(css, /:root\[data-theme="ocean"\]/);
  assert.match(css, /:root\[data-theme="forest"\]/);
  assert.match(css, /:root\[data-theme="sunset"\]/);
  assert.match(css, /:root\[data-theme="midnight"\]/);
  assert.match(css, /\.theme-option\.is-active/);
});
