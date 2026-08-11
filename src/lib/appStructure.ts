export type PageId =
  | "home"
  | "calendar"
  | "stats"
  | "today"
  | "fitness"
  | "diet"
  | "fun"
  | "project"
  | "settings";

export type PageDefinition = {
  id: PageId;
  label: string;
  description: string;
};

export const pages: PageDefinition[] = [
  { id: "home", label: "首页总览", description: "今天的任务、备忘和生活状态集中看" },
  { id: "calendar", label: "日历视图", description: "按月查看任务和记录分布" },
  { id: "stats", label: "统计图表", description: "查看最近活动趋势和模块占比" },
  { id: "today", label: "今日计划", description: "管理当天任务、优先级和完成状态" },
  { id: "fitness", label: "健身计划", description: "记录训练内容、时长和完成情况" },
  { id: "diet", label: "饮食计划", description: "记录餐食、饮水和每日备注" },
  { id: "fun", label: "游戏娱乐", description: "安排游戏、影视、阅读等休闲计划" },
  { id: "settings", label: "数据与设置", description: "管理本地备份、恢复和清空数据" },
];

