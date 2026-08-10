import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PLACEHOLDER_PHRASES,
  createPlaceholderCycler,
  mountPlaceholderCycler,
  nextPhraseIndex,
  shouldShowPlaceholder
} from "../src/placeholder-cycle.js";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    if (force) this.values.add(value);
    else this.values.delete(value);
  }
}

class FakeElement {
  constructor() {
    this.value = "";
    this.textContent = "";
    this.offsetWidth = 100;
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.attributes = {};
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  async trigger(type) {
    return this.listeners.get(type)?.();
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }
}

test("placeholder visibility follows value state", () => {
  assert.equal(shouldShowPlaceholder(""), true);
  assert.equal(shouldShowPlaceholder("今天有点累"), false);
  assert.equal(shouldShowPlaceholder("   "), true);
});

test("placeholder cycler advances phrases and can be stopped", () => {
  const element = new FakeElement();
  let intervalCallback = null;
  let clearedTimer = null;
  const cycler = createPlaceholderCycler({
    element,
    phrases: PLACEHOLDER_PHRASES,
    setIntervalFn: (callback) => {
      intervalCallback = callback;
      return 42;
    },
    clearIntervalFn: (timer) => {
      clearedTimer = timer;
    }
  });

  cycler.start();
  assert.equal(element.textContent, PLACEHOLDER_PHRASES[0]);
  assert.equal(element.classList.contains("is-flipping"), true);

  intervalCallback();
  assert.equal(element.textContent, PLACEHOLDER_PHRASES[1]);
  assert.equal(cycler.getIndex(), 2);

  cycler.stop();
  assert.equal(clearedTimer, 42);
});

test("mounted placeholder hides while typing and shows after clearing", async () => {
  const input = new FakeElement();
  const overlay = new FakeElement();
  const phrase = new FakeElement();
  const documentRef = { activeElement: null };

  const mounted = mountPlaceholderCycler({
    input,
    overlay,
    phrase,
    phrases: PLACEHOLDER_PHRASES,
    documentRef,
    setIntervalFn: () => 1,
    clearIntervalFn: () => {}
  });

  assert.equal(overlay.attributes["aria-hidden"], "false");
  assert.equal(overlay.classList.contains("is-visible"), true);

  documentRef.activeElement = input;
  await input.trigger("focus");
  assert.equal(overlay.attributes["aria-hidden"], "false");

  input.value = "今天被夸了";
  await input.trigger("input");
  assert.equal(overlay.attributes["aria-hidden"], "true");

  input.value = "";
  documentRef.activeElement = null;
  await input.trigger("blur");
  assert.equal(overlay.attributes["aria-hidden"], "false");

  mounted.cycler.stop();
});

test("next phrase index wraps around", () => {
  assert.equal(nextPhraseIndex(0, 4), 1);
  assert.equal(nextPhraseIndex(3, 4), 0);
});