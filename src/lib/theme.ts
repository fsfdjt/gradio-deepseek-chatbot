export type ThemeId = "glass" | "ocean" | "forest" | "sunset" | "midnight";

export type ThemeChoice = {
  id: ThemeId;
  label: string;
  description: string;
};

const themeStorageKey = "work-life-hub-theme";

export const themeChoices: ThemeChoice[] = [
  { id: "glass", label: "玻璃默认", description: "清透、稳定、通用" },
  { id: "ocean", label: "海蓝", description: "更冷静的蓝色工作感" },
  { id: "forest", label: "森绿", description: "更柔和的自然感" },
  { id: "sunset", label: "日落", description: "更温暖的橙粉色" },
  { id: "midnight", label: "午夜", description: "更深色的夜间模式" },
];

export function loadTheme(): ThemeId {
  if (typeof localStorage === "undefined") {
    return "glass";
  }

  const value = localStorage.getItem(themeStorageKey);
  return themeChoices.some((choice) => choice.id === value) ? (value as ThemeId) : "glass";
}

export function saveTheme(theme: ThemeId): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(themeStorageKey, theme);
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}
