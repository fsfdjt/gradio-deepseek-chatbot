import {
  generateReceipt,
  getNextStyleId,
  renderReceiptText
} from "./receipt-generator.js";
import { saveReceiptAsImage } from "./export-image.js";

const MIN_INPUT_LENGTH = 2;

export async function copyText(text, navigatorRef = globalThis.navigator, documentRef = globalThis.document) {
  if (navigatorRef?.clipboard?.writeText) {
    await navigatorRef.clipboard.writeText(text);
    return;
  }

  if (!documentRef?.createElement || !documentRef?.body) {
    throw new Error("当前环境不支持复制");
  }

  const textarea = documentRef.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  documentRef.body.appendChild(textarea);
  textarea.select();
  const copied = documentRef.execCommand?.("copy");
  textarea.remove();

  if (copied === false) {
    throw new Error("复制失败");
  }
}

export function createReceiptController(elements, options = {}) {
  const {
    form,
    input,
    message,
    printButton,
    receipt,
    receiptContent,
    actions,
    promptButtons = [],
    regenerateButton,
    switchStyleButton,
    copyTextButton,
    saveImageButton
  } = elements;
  const generate = options.generate ?? generateReceipt;
  const render = options.render ?? renderReceiptText;
  const copy = options.copyText ?? copyText;
  const saveImage = options.saveImage ?? saveReceiptAsImage;
  const delayMs = options.delayMs ?? 360;
  const setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout;
  const random = options.random;
  const now = options.now;
  let currentReceipt = null;
  let lastInput = "";
  let isGenerating = false;

  const setMessage = (text = "") => {
    if (message) message.textContent = text;
  };

  const setGenerating = (busy) => {
    isGenerating = busy;
    if (printButton) {
      printButton.disabled = busy;
      printButton.textContent = busy ? "打印中..." : "打印小票";
      printButton.setAttribute?.("aria-busy", String(busy));
    }
    receipt?.classList?.toggle?.("is-printing", busy);
    receipt?.setAttribute?.("aria-busy", String(busy));
  };

  const renderReceipt = (nextReceipt) => {
    currentReceipt = nextReceipt;
    if (receiptContent) receiptContent.textContent = render(nextReceipt);
    receipt?.classList?.remove("is-placeholder");
    receipt?.classList?.remove("is-printing");
    if (receipt?.dataset) receipt.dataset.style = nextReceipt.styleId;
    if (actions) actions.hidden = false;
  };

  const print = async (rawInput = input?.value ?? "", styleId) => {
    const normalizedInput = String(rawInput).trim();
    if (normalizedInput.length < MIN_INPUT_LENGTH) {
      setMessage("再多说一点点，收银员看不懂。");
      input?.focus();
      return null;
    }

    if (isGenerating) return null;

    lastInput = normalizedInput;
    setMessage("");
    setGenerating(true);

    await new Promise((resolve) => setTimeoutFn(resolve, delayMs));

    const nextReceipt = generate(normalizedInput, {
      styleId,
      random,
      now
    });
    renderReceipt(nextReceipt);
    setGenerating(false);
    return nextReceipt;
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void print();
  });

  printButton?.addEventListener("click", () => {
    void print();
  });

  promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt ?? "";
      if (input) input.value = prompt;
      setMessage("灵感示例已填入，正在打印。");
      input?.focus();
      void print(prompt);
    });
  });

  regenerateButton?.addEventListener("click", () => {
    if (lastInput) void print(lastInput, currentReceipt?.styleId);
  });

  switchStyleButton?.addEventListener("click", () => {
    if (lastInput) {
      const nextStyleId = getNextStyleId(currentReceipt?.styleId);
      void print(lastInput, nextStyleId);
    }
  });

  copyTextButton?.addEventListener("click", async () => {
    if (!currentReceipt) return;
    try {
      await copy(render(currentReceipt));
      setMessage("小票文字已复制。");
    } catch {
      setMessage("复制失败，请手动选择小票文字。");
    }
  });

  saveImageButton?.addEventListener("click", () => {
    if (!currentReceipt) return;
    try {
      saveImage(currentReceipt);
      setMessage("小票已装进口袋。");
    } catch {
      setMessage("图片保存失败，请稍后再试。");
    }
  });

  return {
    print,
    getState: () => ({
      currentReceipt,
      lastInput,
      isGenerating
    })
  };
}

export function mountApp(documentRef = globalThis.document) {
  if (!documentRef?.querySelector) return null;

  const elements = {
    form: documentRef.querySelector("[data-receipt-form]"),
    input: documentRef.querySelector("[data-input]"),
    message: documentRef.querySelector("[data-message]"),
    printButton: documentRef.querySelector("[data-print-button]"),
    receipt: documentRef.querySelector("[data-receipt]"),
    receiptContent: documentRef.querySelector("[data-receipt-content]"),
    actions: documentRef.querySelector("[data-actions]"),
    promptButtons: [...documentRef.querySelectorAll("[data-prompt]")],
    regenerateButton: documentRef.querySelector("[data-regenerate]"),
    switchStyleButton: documentRef.querySelector("[data-switch-style]"),
    copyTextButton: documentRef.querySelector("[data-copy-text]"),
    saveImageButton: documentRef.querySelector("[data-save-image]")
  };

  elements.input?.focus();
  return createReceiptController(elements);
}

if (typeof document !== "undefined") {
  mountApp(document);
}
