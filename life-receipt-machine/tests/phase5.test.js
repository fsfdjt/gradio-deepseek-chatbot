import assert from "node:assert/strict";
import { test } from "node:test";
import { drawReceiptToCanvas, saveReceiptAsImage } from "../src/export-image.js";
import { generateReceipt } from "../src/receipt-generator.js";
import { createReceiptController } from "../src/app.js";

const receipt = generateReceipt("今天被夸了", {
  styleId: "gentle-store",
  now: new Date("2026-08-10T12:00:00.000Z"),
  random: () => 0.2
});

const createCanvas = () => {
  const calls = [];
  const context = {
    fillStyle: "",
    font: "",
    textBaseline: "",
    fillRect: (...args) => calls.push(["fillRect", ...args]),
    fillText: (...args) => calls.push(["fillText", ...args])
  };
  return {
    calls,
    width: 0,
    height: 0,
    getContext: () => context,
    toDataURL: (type) => `data:${type};base64,receipt`
  };
};

test("Canvas renderer creates a stable PNG-sized canvas and draws text", () => {
  const canvas = createCanvas();
  drawReceiptToCanvas(receipt, canvas);

  assert.equal(canvas.width, 720);
  assert.ok(canvas.height > 0);
  assert.equal(canvas.calls.some(([name]) => name === "fillRect"), true);
  assert.equal(canvas.calls.filter(([name]) => name === "fillText").length > 10, true);
});

test("saveReceiptAsImage returns a PNG data URL and filename", () => {
  const canvas = createCanvas();
  const documentRef = {
    createElement: (tag) => {
      assert.equal(tag, "canvas");
      return canvas;
    }
  };

  let downloaded = null;
  const result = saveReceiptAsImage(receipt, {
    documentRef,
    download: (dataUrl, filename) => {
      downloaded = { dataUrl, filename };
    }
  });

  assert.equal(result.dataUrl, "data:image/png;base64,receipt");
  assert.equal(result.filename, "life-receipt-20260810.png");
  assert.deepEqual(downloaded, result);
});

test("save button reports success after a generated receipt exists", async () => {
  const makeElement = (dataset = {}) => ({
    dataset,
    value: "",
    textContent: "",
    hidden: true,
    disabled: false,
    listeners: new Map(),
    classList: { add() {}, remove() {} },
    addEventListener(type, handler) {
      this.listeners.set(type, handler);
    },
    async trigger(type, event = {}) {
      return this.listeners.get(type)?.(event);
    },
    focus() {}
  });
  const elements = {
    form: makeElement(),
    input: makeElement(),
    message: makeElement(),
    printButton: makeElement(),
    receipt: makeElement(),
    receiptContent: makeElement(),
    actions: makeElement(),
    promptButtons: [],
    regenerateButton: makeElement(),
    switchStyleButton: makeElement(),
    copyTextButton: makeElement(),
    saveImageButton: makeElement()
  };
  createReceiptController(elements, {
    delayMs: 0,
    setTimeoutFn: (resolve) => resolve(),
    saveImage: () => ({ filename: "life-receipt-20260810.png" })
  });

  elements.input.value = "今天被夸了";
  await elements.form.trigger("submit", { preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  await elements.saveImageButton.trigger("click");

  assert.match(elements.message.textContent, /小票已装进口袋/);
});

