const receiptStyles = [
  {
    id: "gentle-store",
    name: "温柔便利店",
    keywords: ["开心", "被夸", "好运", "喜欢", "温柔", "小确幸", "快乐"],
    stores: ["人生便利店", "今日补给站", "小小快乐商店"],
    items: [
      ["今日小确幸", "1份", "+6.00"],
      ["被世界轻轻接住", "1次", "+4.20"],
      ["心里亮了一下", "2秒", "+2.80"],
      ["好运预存款", "1笔", "+3.60"]
    ],
    totals: ["今天值得", "快乐正在到账", "小小胜利"],
    notes: [
      "你今天没有满分，但也没有缺席。",
      "小事也会发光，尤其是被你认真记住的小事。"
    ],
    closings: ["谢谢惠顾，欢迎再来人间。", "愿你下次来得更轻松。"]
  },
  {
    id: "absurd-office",
    name: "离谱事务所",
    keywords: ["倒霉", "尴尬", "下雨", "迟到", "社死", "好笑", "翻车"],
    stores: ["离谱事务所", "今天也没事处", "人类故障处理中心"],
    items: [
      ["无语瞬间", "3次", "-2.40"],
      ["差点当场消失", "1次", "-4.80"],
      ["尴尬回放权限", "无限", "免费"],
      ["笑着活下去", "1份", "+9.90"]
    ],
    totals: ["离谱但能活", "笑一下就算赢", "今日剧情超预算"],
    notes: [
      "这不是你的错，是今天的剧本比较有想法。",
      "事情已经发生了，至少它现在变成了一个好故事。"
    ],
    closings: ["本次事故已归档，欢迎下次继续出场。", "离谱事务所祝你平安下班。"]
  },
  {
    id: "cosmic-counter",
    name: "宇宙收银台",
    keywords: ["梦", "未来", "宇宙", "人生", "星星", "月亮", "命运"],
    stores: ["宇宙收银台", "银河临时服务站", "平行时空便利店"],
    items: [
      ["平行宇宙可能性", "3种", "待展开"],
      ["来自未来的暗示", "1条", "待解码"],
      ["星尘余额", "42g", "可使用"],
      ["普通人的奇迹", "1件", "不可标价"]
    ],
    totals: ["宇宙仍然运行", "今天也在发光", "未来尚未结算"],
    notes: [
      "宇宙没有给出答案，但给你留了一盏灯。",
      "请保管好今天，未来的你可能会回来领取。"
    ],
    closings: ["本次时空交易安全完成。", "银河祝你今晚做一个好梦。"]
  },
  {
    id: "worker-station",
    name: "打工人补给站",
    keywords: ["累", "困", "熬夜", "加班", "通勤", "摸鱼", "工作", "上班"],
    stores: ["打工人补给站", "星期一急救中心", "摸鱼能源站"],
    items: [
      ["精神电量", "1格", "36%"],
      ["强行清醒", "2次", "-3.50"],
      ["摸鱼时间", "7分钟", "+2.00"],
      ["会议幸存经验", "1份", "+8.80"]
    ],
    totals: ["还算撑住", "今日成功存活", "下班值得庆祝"],
    notes: [
      "你不是电量不足，你只是今天消耗得太多。",
      "工作可以明天再想，今晚先把自己充上电。"
    ],
    closings: ["打工人补给站祝你准时下班。", "请携带尊严和零食离开。"]
  }
];

const prompts = [
  "今天有点累，但还是撑过去了",
  "今天遇到一个很小但很亮的开心瞬间",
  "今天有点倒霉，但回头想想又很好笑"
];

const pick = (items, random) => items[Math.floor(random() * items.length) % items.length];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const inferStyle = (input, random) => {
  const style = receiptStyles.find((item) =>
    item.keywords.some((keyword) => input.includes(keyword))
  );

  return style || pick(receiptStyles, random);
};

const nextStyle = (styleId) => {
  const index = receiptStyles.findIndex((style) => style.id === styleId);

  return receiptStyles[(index + 1 + receiptStyles.length) % receiptStyles.length];
};

const buildText = (receipt) => [
  receipt.storeName,
  `RECEIPT #${receipt.receiptNumber}`,
  receipt.dateLabel,
  "--------------------------",
  ...receipt.items.map((item) => `${item[0]}  ${item[1]}  ${item[2]}`),
  "--------------------------",
  `今日合计：${receipt.totalLabel}`,
  "",
  "店员留言：",
  receipt.note,
  "",
  receipt.closing,
  "",
  `本次输入：${receipt.input}`
].join("\n");

const generateReceipt = (input, options = {}) => {
  const normalizedInput = String(input || "").trim().replace(/\s+/g, " ");
  const random = options.random || Math.random;
  const date = options.now || new Date();
  const style = options.styleId
    ? receiptStyles.find((item) => item.id === options.styleId) || receiptStyles[0]
    : inferStyle(normalizedInput, random);

  const receipt = {
    input: normalizedInput,
    styleId: style.id,
    styleName: style.name,
    storeName: pick(style.stores, random),
    receiptNumber: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.floor(random() * 900 + 100)}`,
    dateLabel: formatDate(date),
    items: style.items.slice(0, 4),
    totalLabel: pick(style.totals, random),
    note: pick(style.notes, random),
    closing: pick(style.closings, random)
  };

  receipt.text = buildText(receipt);
  return receipt;
};

module.exports = {
  prompts,
  receiptStyles,
  generateReceipt,
  nextStyle
};
