import assert from "node:assert/strict";
import { test } from "node:test";
import { createReceiptController } from "../src/app.js";

class FakeElement {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.value = "";
    this.textContent = "";
    this.hidden = true;
    this.disabled = false;
    this.listeners = new Map();
    this.classList = {
      values: new Set(),
      add: (value) => this.classList.values.add(value),
      remove: (value) => this.classList.values.delete(value),
      contains: (value) => this.classList.values.has(value),
      toggle: (value, force) => {
        if (force) this.classList.values.add(value);
        else this.classList.values.delete(value);
      }
    };
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  async trigger(type, event = {}) {
    return this.listeners.get(type)?.(event);
  }

  focus() {
    this.focused = true;
  }

  setAttribute(name, value) {
    this[name] = value;
  }
}

const createElements = () => {
  const promptOne = new FakeElement({ prompt: "今天有点累，但还是撑过去了" });
  const promptTwo = new FakeElement({ prompt: "今天遇到一个很小但很亮的开心瞬间" });
  const promptThree = new FakeElement({ prompt: "今天有点倒霉，但回头想想又很好笑" });
  return {
    form: new FakeElement(),
    input: new FakeElement(),
    message: new FakeElement(),
    printButton: new FakeElement(),
    receipt: new FakeElement(),
    receiptContent: new FakeElement(),
    actions: new FakeElement(),
    promptButtons: [promptOne, promptTwo, promptThree],
    regenerateButton: new FakeElement(),
    switchStyleButton: new FakeElement(),
    copyTextButton: new FakeElement(),
    prompts: [promptOne, promptTwo, promptThree]
  };
};

const immediateTimer = (resolve) => resolve();

test("printing creates a receipt and reveals actions", async () => {
  const elements = createElements();
  const controller = createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

  elements.input.value = "今天加班但终于下班了";
  await elements.form.trigger("submit", { preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(elements.printButton.disabled, false);
  assert.equal(elements.actions.hidden, false);
  assert.equal(elements.receipt.classList.contains("is-placeholder"), false);
  assert.match(elements.receiptContent.textContent, /今日合计：/);
  assert.equal(controller.getState().lastInput, "今天加班但终于下班了");
});

test("clicking the print button directly creates a receipt", async () => {
  const elements = createElements();
  createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

  elements.input.value = "今天终于准时下班";
  await elements.printButton.trigger("click");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(elements.actions.hidden, false);
  assert.match(elements.receiptContent.textContent, /本次输入：今天终于准时下班/);
  assert.equal(elements.printButton.textContent, "打印小票");
});

test("short input is rejected with a helpful message", async () => {
  const elements = createElements();
  createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

  elements.input.value = "好";
  await elements.form.trigger("submit", { preventDefault() {} });

  assert.match(elements.message.textContent, /再多说一点点/);
  assert.equal(elements.actions.hidden, true);
  assert.equal(elements.input.focused, true);
});

test("prompt buttons are examples that fill the input", async () => {
  const elements = createElements();
  createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

  await elements.prompts[1].trigger("click");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(elements.input.value, "今天遇到一个很小但很亮的开心瞬间");
  assert.match(elements.receiptContent.textContent, /本次输入：今天遇到一个很小但很亮的开心瞬间/);
  assert.equal(elements.actions.hidden, false);
  assert.equal(elements.input.focused, true);
});

test("all three prompt examples fill the input and print immediately", async () => {
  for (const [index, expected] of [
    [0, "今天有点累，但还是撑过去了"],
    [1, "今天遇到一个很小但很亮的开心瞬间"],
    [2, "今天有点倒霉，但回头想想又很好笑"]
  ]) {
    const elements = createElements();
    createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

    await elements.prompts[index].trigger("click");
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(elements.input.value, expected);
    assert.match(elements.receiptContent.textContent, new RegExp(`本次输入：${expected}`));
    assert.equal(elements.actions.hidden, false);
  }
});

test("regenerate preserves input and switch style changes the style", async () => {
  const elements = createElements();
  createReceiptController(elements, { delayMs: 0, setTimeoutFn: immediateTimer });

  elements.input.value = "今天有点累";
  await elements.form.trigger("submit", { preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  const firstStyle = elements.receipt.dataset.style;

  await elements.regenerateButton.trigger("click");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(elements.receipt.dataset.style, firstStyle);

  await elements.switchStyleButton.trigger("click");
  await new Promise((resolve) => setImmediate(resolve));
  assert.notEqual(elements.receipt.dataset.style, firstStyle);
});

test("copy button uses the generated receipt text", async () => {
  const elements = createElements();
  let copied = "";
  createReceiptController(elements, {
    delayMs: 0,
    setTimeoutFn: immediateTimer,
    copyText: async (text) => {
      copied = text;
    }
  });

  elements.input.value = "今天被夸了";
  await elements.form.trigger("submit", { preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  await elements.copyTextButton.trigger("click");

  assert.match(copied, /本次输入：今天被夸了/);
  assert.match(elements.message.textContent, /已复制/);
});
