import { renderReceiptText } from "./receipt-generator.js";

export function drawReceiptToCanvas(receipt, canvas, options = {}) {
  const {
    width = 720,
    padding = 56,
    lineHeight = 36,
    background = "#fffaf0",
    ink = "#24211c"
  } = options;
  const lines = renderReceiptText(receipt).split("\n");
  const height = padding * 2 + Math.max(lines.length, 1) * lineHeight;
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.fillStyle = ink;
  context.font = '24px "Courier New", "Microsoft YaHei", monospace';
  context.textBaseline = "top";

  lines.forEach((line, index) => {
    context.fillText(line, padding, padding + index * lineHeight);
  });

  return canvas;
}

export function createReceiptPngDataUrl(receipt, documentRef = globalThis.document) {
  if (!documentRef?.createElement) {
    throw new Error("当前环境不支持图片导出");
  }

  const canvas = documentRef.createElement("canvas");
  drawReceiptToCanvas(receipt, canvas);
  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl, filename, documentRef = globalThis.document) {
  if (!documentRef?.createElement || !documentRef?.body) {
    throw new Error("当前环境不支持文件下载");
  }

  const link = documentRef.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  documentRef.body.appendChild(link);
  link.click();
  link.remove();
}

export function saveReceiptAsImage(receipt, options = {}) {
  const documentRef = options.documentRef ?? globalThis.document;
  const dataUrl = createReceiptPngDataUrl(receipt, documentRef);
  const dateCode = receipt.receiptNumber.split("-")[0];
  const filename = `life-receipt-${dateCode}.png`;
  (options.download ?? downloadDataUrl)(dataUrl, filename, documentRef);
  return { dataUrl, filename };
}

