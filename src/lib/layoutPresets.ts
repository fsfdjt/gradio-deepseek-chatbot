import type { PageId } from "./appStructure";

export type LayoutPreset = {
  id: PageId;
  kind: "dashboard" | "calendar" | "stats" | "record-manager" | "project-detail" | "settings";
  components: Array<"card" | "form" | "list" | "progress" | "timeline" | "sidebar">;
};

export const layoutPresets: Record<PageId, LayoutPreset> = {
  home: {
    id: "home",
    kind: "dashboard",
    components: ["card", "progress", "timeline", "sidebar"],
  },
  calendar: {
    id: "calendar",
    kind: "calendar",
    components: ["card", "timeline", "list"],
  },
  stats: {
    id: "stats",
    kind: "stats",
    components: ["card", "progress", "list"],
  },
  today: {
    id: "today",
    kind: "record-manager",
    components: ["form", "list", "card"],
  },
  fitness: {
    id: "fitness",
    kind: "record-manager",
    components: ["form", "list", "card"],
  },
  diet: {
    id: "diet",
    kind: "record-manager",
    components: ["form", "list", "card"],
  },
  fun: {
    id: "fun",
    kind: "record-manager",
    components: ["form", "list", "card"],
  },
  project: {
    id: "project",
    kind: "project-detail",
    components: ["form", "list", "card", "sidebar"],
  },
  settings: {
    id: "settings",
    kind: "settings",
    components: ["card", "form"],
  },
};

export function getLayoutPreset(pageId: PageId): LayoutPreset {
  return layoutPresets[pageId];
}
