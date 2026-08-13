import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getNewCharacterStart,
  mountTypingEffect,
  renderTypingEffect
} from "../src/input-text-effect.js";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class FakeElement {
  constructor() {
    this.children = [];
    this.listeners = new Map();
    this.attributes = {};
    this.classList = new FakeClassList();
    this.value = "";
    this.textContent = "";
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  trigger(type) {
    this.listeners.get(type)?.();
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  replaceChildren() {
    this.children = [];
  }
}

const documentRef = {
  createElement: () => new FakeElement()
};

test("new character start uses the shared prefix", () => {
  assert.equal(getNewCharacterStart("今天", "今天有"), 2);
  assert.equal(getNewCharacterStart("今天有点累", "今天开心"), 2);
  assert.equal(getNewCharacterStart("", "新"), 0);
});

test("renderTypingEffect only marks newly added characters", () => {
  const container = new FakeElement();

  renderTypingEffect({
    container,
    value: "今天有",
    previousValue: "今天",
    documentRef
  });

  assert.equal(container.attributes["aria-hidden"], "false");
  assert.equal(container.children.length, 3);
  assert.equal(container.children[0].classList.contains("is-new-char"), false);
  assert.equal(container.children[2].classList.contains("is-new-char"), true);
});

test("renderTypingEffect hides the overlay when input is empty", () => {
  const container = new FakeElement();

  renderTypingEffect({ container, value: "", previousValue: "今天", documentRef });

  assert.equal(container.attributes["aria-hidden"], "true");
  assert.equal(container.children.length, 0);
});

test("mounted typing effect updates when the input event fires", () => {
  const input = new FakeElement();
  const container = new FakeElement();
  mountTypingEffect({ input, container, documentRef });

  input.value = "小确幸";
  input.trigger("input");

  assert.equal(container.attributes["aria-hidden"], "false");
  assert.equal(container.children.map((child) => child.textContent).join(""), "小确幸");
  assert.equal(container.children.every((child) => child.classList.contains("is-new-char")), true);
});