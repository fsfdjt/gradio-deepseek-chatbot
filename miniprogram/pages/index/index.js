const { generateReceipt, nextStyle, prompts } = require("../../utils/receipt");

const MIN_INPUT_LENGTH = 2;

Page({
  data: {
    inputValue: "",
    prompts,
    message: "",
    isGenerating: false,
    receipt: null
  },

  onInput(event) {
    this.setData({
      inputValue: event.detail.value,
      message: ""
    });
  },

  onPromptTap(event) {
    const prompt = event.currentTarget.dataset.prompt;

    this.setData({
      inputValue: prompt,
      message: "灵感已填入，正在为你打印。"
    });
    this.printReceipt(prompt);
  },

  onPrintTap() {
    this.printReceipt(this.data.inputValue);
  },

  onRegenerateTap() {
    if (this.data.receipt) {
      this.printReceipt(this.data.inputValue, this.data.receipt.styleId);
    }
  },

  onSwitchStyleTap() {
    if (this.data.receipt) {
      const next = nextStyle(this.data.receipt.styleId);
      this.printReceipt(this.data.inputValue, next.id);
    }
  },

  onCopyTap() {
    if (!this.data.receipt) return;

    wx.setClipboardData({
      data: this.data.receipt.text,
      success: () => {
        this.setData({ message: "小票文字已复制。" });
      }
    });
  },

  onSaveTap() {
    if (!this.data.receipt) return;

    this.drawReceiptImage(() => {
      wx.canvasToTempFilePath({
        canvasId: "receiptCanvas",
        success: (result) => {
          wx.saveImageToPhotosAlbum({
            filePath: result.tempFilePath,
            success: () => this.setData({ message: "小票已保存到相册。" }),
            fail: () => this.setData({ message: "保存需要相册权限，请授权后再试。" })
          });
        },
        fail: () => this.setData({ message: "图片生成失败，请稍后再试。" })
      });
    });
  },

  printReceipt(rawInput, styleId) {
    const input = String(rawInput || "").trim();
    if (input.length < MIN_INPUT_LENGTH) {
      this.setData({ message: "再多说一点点，收银员看不懂。" });
      return;
    }

    if (this.data.isGenerating) return;

    this.setData({
      isGenerating: true,
      message: ""
    });

    setTimeout(() => {
      this.setData({
        isGenerating: false,
        receipt: generateReceipt(input, { styleId })
      });
    }, 320);
  },

  drawReceiptImage(done) {
    const context = wx.createCanvasContext("receiptCanvas", this);
    const lines = this.data.receipt.text.split("\n");

    context.setFillStyle("#fffaf0");
    context.fillRect(0, 0, 720, 1100);
    context.setFillStyle("#24211c");
    context.setFontSize(28);

    let y = 64;
    lines.forEach((line) => {
      const chunks = line ? this.wrapLine(context, line, 610) : [""];
      chunks.forEach((chunk) => {
        context.fillText(chunk, 56, y);
        y += 42;
      });
    });

    context.draw(false, done);
  },

  wrapLine(context, text, maxWidth) {
    const lines = [];
    let current = "";

    Array.from(text).forEach((character) => {
      const next = current + character;
      if (context.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = character;
        return;
      }
      current = next;
    });

    if (current) lines.push(current);
    return lines;
  }
});
