import { getReceiptStyle, receiptStyles } from "./receipt-templates.js";

const defaultRandom = () => Math.random();

const pick = (items, random = defaultRandom) =>
  items[Math.floor(random() * items.length) % items.length];

const normalizeInput = (input) => String(input ?? "").trim().replace(/\s+/g, " ");

export const STYLE_IDS = receiptStyles.map((style) => style.id);

export function inferStyleId(input, random = defaultRandom) {
  const normalized = normalizeInput(input);
  const matched = receiptStyles.find((style) =>
    style.keywords.some((keyword) => normalized.includes(keyword))
  );

  return matched?.id ?? pick(STYLE_IDS, random);
}

export function getNextStyleId(currentStyleId) {
  const index = STYLE_IDS.indexOf(currentStyleId);
  return STYLE_IDS[(index + 1 + STYLE_IDS.length) % STYLE_IDS.length];
}

export function generateReceipt(input, options = {}) {
  const normalizedInput = normalizeInput(input);
  const random = options.random ?? defaultRandom;
  const styleId = options.styleId ?? inferStyleId(normalizedInput, random);
  const style = getReceiptStyle(styleId);
  const now = options.now instanceof Date ? options.now : new Date();
  const dateCode = now.toISOString().slice(0, 10).replaceAll("-", "");
  const receiptNumber = `${dateCode}-${String(Math.floor(random() * 900) + 100)}`;

  return {
    input: normalizedInput,
    styleId: style.id,
    styleName: style.name,
    storeName: pick(style.stores, random),
    receiptNumber,
    dateLabel: now.toLocaleDateString("zh-CN"),
    items: Array.from({ length: 4 }, () => pick(style.items, random)),
    totalLabel: pick(style.totals, random),
    lifeTax: pick(style.taxes, random),
    cashback: pick(style.cashbacks, random),
    note: pick(style.notes, random),
    closing: pick(style.closings, random)
  };
}

export function renderReceiptText(receipt) {
  const itemLines = receipt.items
    .map(([label, quantity, amount]) => `${label.padEnd(16, " ")}${quantity.padEnd(7, " ")}${amount}`)
    .join("\n");

  return [
    receipt.storeName,
    `RECEIPT #${receipt.receiptNumber}`,
    receipt.dateLabel,
    "",
    itemLines,
    "",
    "----------------------------",
    `今日合计：${receipt.totalLabel}`,
    `生活税：${receipt.lifeTax}`,
    `快乐返现：${receipt.cashback}`,
    "",
    "店员留言：",
    receipt.note,
    "",
    receipt.closing,
    "",
    `本次输入：${receipt.input}`
  ].join("\n");
}

