import {
  CheckSquare,
  CalendarDays,
  BarChart3,
  Download,
  Dumbbell,
  FolderPlus,
  Gamepad2,
  Home,
  ListPlus,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { pages, type PageId } from "./lib/appStructure";
import { createBackup, parseBackup } from "./lib/backup";
import {
  addCustomItem,
  addCustomProject,
  addEntertainment,
  addMeal,
  addMemo,
  addTask,
  addWorkout,
  createEmptyData,
  createId,
  deleteCustomItem,
  deleteCustomProject,
  deleteEntertainment,
  deleteMeal,
  deleteMemo,
  deleteTask,
  deleteWorkout,
  filterTasks,
  getDashboardSummary,
  getHomeTimeline,
  getTimeRemainingPercentages,
  priorityLabel,
  setTaskDone,
  statusLabel,
  todayString,
  updateCustomItem,
  updateCustomProject,
  updateEntertainment,
  updateMeal,
  updateMemo,
  updateTask,
  updateWorkout,
} from "./lib/domain";
import { getLayoutPreset } from "./lib/layoutPresets";
import { getSmartInsights } from "./lib/insights";
import { getMonthCalendar } from "./lib/calendar";
import { getStatsOverview } from "./lib/stats";
import { getReminderItems } from "./lib/reminders";
import { getNutritionOverview } from "./lib/nutrition";
import { applyTheme, loadTheme, saveTheme, themeChoices, type ThemeId } from "./lib/theme";
import { clearAppData, loadAppData, saveAppData } from "./lib/storage";
import type {
  AppData,
  EntertainmentStatus,
  EntertainmentType,
  MealType,
  Priority,
  TaskStatus,
  WorkoutType,
} from "./lib/types";

const icons: Record<PageId, typeof Home> = {
  home: Home,
  calendar: CalendarDays,
  stats: BarChart3,
  today: CheckSquare,
  fitness: Dumbbell,
  diet: Utensils,
  fun: Gamepad2,
  project: FolderPlus,
  settings: Settings,
};

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const today = todayString();

const navigationGroups: Array<{ label: string; items: PageId[] }> = [
  { label: "日常", items: ["home", "today", "calendar"] },
  { label: "生活", items: ["fitness", "diet", "fun"] },
  { label: "分析", items: ["stats"] },
  { label: "系统", items: ["project", "settings"] },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [data, setData] = useState<AppData>(() => createEmptyData());
  const [isHydrated, setIsHydrated] = useState(false);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState<ThemeId>(() => loadTheme());
  const [taskFilter, setTaskFilter] = useState<"all" | TaskStatus>("all");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [quickProjectName, setQuickProjectName] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const quickProjectInputRef = useRef<HTMLInputElement>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));

  useEffect(() => {
    loadAppData()
      .then((stored) => {
        setData(stored ?? createEmptyData());
        setIsHydrated(true);
      })
      .catch(() => {
        setMessage("读取本地 IndexedDB 数据失败，已进入空白数据状态");
        setIsHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveAppData(data).catch(() => {
      setMessage("保存本地数据失败，请检查浏览器 IndexedDB 权限");
    });
  }, [data, isHydrated]);

  const reminderItems = useMemo(() => getReminderItems(data, new Date()), [data]);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (notificationPermission !== "granted" || typeof Notification === "undefined") {
      return;
    }

    const timers = reminderItems
      .filter((item) => item.minutesUntil >= 0 && item.minutesUntil <= 24 * 60)
      .map((item) =>
        window.setTimeout(() => {
          new Notification("Work Life Hub 提醒", {
            body: `${item.title} · ${item.timeLabel}`,
          });
        }, Math.max(0, new Date(item.scheduledAt).getTime() - Date.now())),
      );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notificationPermission, reminderItems]);

  const summary = useMemo(() => getDashboardSummary(data, today), [data]);
  const timeline = useMemo(() => getHomeTimeline(data, today), [data]);
  const smartInsights = useMemo(() => getSmartInsights(data, today), [data]);
  const timeRemaining = useMemo(() => getTimeRemainingPercentages(new Date()), []);
  const selectedProject =
    data.customProjects.find((project) => project.id === selectedProjectId) ??
    data.customProjects[0];
  const layoutPreset = getLayoutPreset(activePage);
  const currentPage =
    activePage === "project"
      ? {
          label: selectedProject?.name ?? "项目",
          description: selectedProject
            ? "管理这个项目里的清单条目"
            : "从左侧快速新增一个项目后开始管理",
        }
      : (pages.find((page) => page.id === activePage) ?? pages[0]);

  function mutate(updater: (value: AppData) => AppData) {
    setData((current) => updater(current));
  }

  function handleQuickAddProject(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const projectId = createId("project");
    mutate((current) => addCustomProject(current, { id: projectId, name: trimmedName }));
    setSelectedProjectId(projectId);
    setActivePage("project");
    setQuickProjectName("");
  }

  function focusQuickProjectInput() {
    setSidebarCollapsed(false);
    window.requestAnimationFrame(() => quickProjectInputRef.current?.focus());
  }

  async function handleEnableNotifications() {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      setMessage("当前浏览器不支持通知");
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
    setNotificationPermission(permission);
    setMessage(permission === "granted" ? "已开启浏览器通知" : "未授予浏览器通知权限");
  }

  if (!isHydrated) {
    return <main className="auth-screen">正在读取本地数据...</main>;
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Home size={18} />
          </span>
          <span className="brand-copy">Work Life Hub</span>
        </div>
        <form
          className="quick-add-project"
          aria-label="快速新增项目"
          onSubmit={(event) => {
            event.preventDefault();
            handleQuickAddProject(quickProjectName);
          }}
        >
          <input
            ref={quickProjectInputRef}
            value={quickProjectName}
            onChange={(event) => setQuickProjectName(event.target.value)}
            placeholder="快速新增项目"
            aria-label="项目名称"
          />
          <button type="submit" aria-label="新增项目">
            <Plus size={18} />
          </button>
        </form>
        <nav className="main-nav" aria-label="主导航">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-group-label">{group.label}</p>
              {group.items.map((pageId) => {
                const page = pages.find((item) => item.id === pageId);
                if (!page) return null;
                const Icon = icons[page.id];
                return (
                  <button
                    key={page.id}
                    type="button"
                    aria-pressed={activePage === page.id}
                    onClick={() => setActivePage(page.id)}
                    title={sidebarCollapsed ? page.label : undefined}
                  >
                    <Icon size={18} />
                    <span>{page.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-projects" aria-label="项目列表">
          <p className="sidebar-section-title">项目</p>
          {data.customProjects.length ? (
            data.customProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                aria-pressed={activePage === "project" && selectedProject?.id === project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setActivePage("project");
                }}
              >
                <FolderPlus size={16} />
                <span>{project.name}</span>
                <small>{project.items.filter((item) => !item.completed).length}</small>
              </button>
            ))
          ) : (
            <p className="empty-sidebar-text">暂无项目</p>
          )}
        </div>
      </aside>

      <main className={`workspace workspace-${layoutPreset.kind}`}>
        <header className="topbar">
          <div className="topbar-context">
            <button
              type="button"
              className="icon-button"
              aria-label={sidebarCollapsed ? "展开导航" : "收起导航"}
              title={sidebarCollapsed ? "展开导航" : "收起导航"}
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              <PanelLeft size={18} />
            </button>
            <span className="topbar-page-icon" aria-hidden="true">
              {(() => {
                const Icon = icons[activePage];
                return <Icon size={18} />;
              })()}
            </span>
            <div>
            <h1>{currentPage.label}</h1>
            <p>{currentPage.description}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-action"
              onClick={() => setMessage("当前数据仅保存在这台电脑的浏览器中")}
            >
              <Search size={17} />
              <span>本地数据</span>
            </button>
            <div className="quick-menu-wrap">
              <button
                type="button"
                className="primary-button topbar-action"
                onClick={() => setQuickMenuOpen((value) => !value)}
                aria-expanded={quickMenuOpen}
              >
                <ListPlus size={17} />
                <span>快速新增</span>
              </button>
              {quickMenuOpen ? (
                <div className="quick-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setActivePage("today"); setQuickMenuOpen(false); }}>
                    新增今日计划
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setActivePage("fitness"); setQuickMenuOpen(false); }}>
                    记录训练
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setActivePage("diet"); setQuickMenuOpen(false); }}>
                    记录饮食
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setQuickMenuOpen(false); focusQuickProjectInput(); }}>
                    新增自定义项目
                  </button>
                </div>
              ) : null}
            </div>
            <p className="local-note">仅保存在这台电脑</p>
          </div>
        </header>

        {message ? <p className="app-message">{message}</p> : null}

        {activePage === "home" ? (
          <HomePageWorkbench
            data={data}
            summary={summary}
            smartInsights={smartInsights}
            timeline={timeline}
            timeRemaining={timeRemaining}
            onTaskDone={(id, done) => mutate((value) => setTaskDone(value, id, done))}
            onAddMemo={(content) => mutate((value) => addMemo(value, { content }))}
            onOpenPage={setActivePage}
          />
        ) : null}
        {activePage === "calendar" ? <CalendarPage data={data} /> : null}
        {activePage === "stats" ? <StatsPage data={data} /> : null}
        {activePage === "today" ? (
          <TodayPage
            data={data}
            filter={taskFilter}
            onFilter={setTaskFilter}
            onAdd={(input) => mutate((value) => addTask(value, input))}
            onUpdate={(id, patch) => mutate((value) => updateTask(value, id, patch))}
            onDone={(id, done) => mutate((value) => setTaskDone(value, id, done))}
            onDelete={(id) => mutate((value) => deleteTask(value, id))}
          />
        ) : null}
        {activePage === "fitness" ? (
          <FitnessPage
            data={data}
            onAdd={(input) => mutate((value) => addWorkout(value, input))}
            onUpdate={(id, patch) => mutate((value) => updateWorkout(value, id, patch))}
            onDelete={(id) => mutate((value) => deleteWorkout(value, id))}
          />
        ) : null}
        {activePage === "diet" ? (
          <DietPage
            data={data}
            onAdd={(input) => mutate((value) => addMeal(value, input))}
            onUpdate={(id, patch) => mutate((value) => updateMeal(value, id, patch))}
            onDelete={(id) => mutate((value) => deleteMeal(value, id))}
          />
        ) : null}
        {activePage === "fun" ? (
          <FunPage
            data={data}
            onAdd={(input) => mutate((value) => addEntertainment(value, input))}
            onUpdate={(id, patch) =>
              mutate((value) => updateEntertainment(value, id, patch))
            }
            onDelete={(id) => mutate((value) => deleteEntertainment(value, id))}
          />
        ) : null}
        {activePage === "project" ? (
          <ProjectPage
            selectedProject={selectedProject}
            onUpdateProject={(id, patch) =>
              mutate((value) => updateCustomProject(value, id, patch))
            }
            onDeleteProject={(id) => {
              mutate((value) => deleteCustomProject(value, id));
              setSelectedProjectId("");
            }}
            onAddItem={(projectId, input) =>
              mutate((value) => addCustomItem(value, projectId, input))
            }
            onUpdateItem={(projectId, itemId, patch) =>
              mutate((value) => updateCustomItem(value, projectId, itemId, patch))
            }
            onDeleteItem={(projectId, itemId) =>
              mutate((value) => deleteCustomItem(value, projectId, itemId))
            }
          />
        ) : null}
        {activePage === "settings" ? (
          <SettingsPage
            data={data}
            message={message}
            theme={theme}
            reminderItems={reminderItems}
            notificationPermission={notificationPermission}
            onEnableNotifications={handleEnableNotifications}
            onSelectTheme={setTheme}
            onExport={() => {
              const backup = createBackup(data);
              const blob = new Blob([JSON.stringify(backup, null, 2)], {
                type: "application/json",
              });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `work-life-hub-backup-${today}.json`;
              link.click();
              URL.revokeObjectURL(link.href);
              setMessage("已导出 JSON 备份");
            }}
            onImport={async (file) => {
              try {
                const backup = parseBackup(await file.text());
                setData(backup.data);
                await saveAppData(backup.data);
                setMessage("已导入 JSON 备份");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "导入失败");
              }
            }}
            onClear={async () => {
              if (confirm("确定清空全部本地数据吗？此操作不可恢复")) {
                await clearAppData();
                setData(createEmptyData());
                setSelectedProjectId("");
                setMessage("已清空当前浏览器中的本地数据");
              }
            }}
          />
        ) : null}
      </main>
    </div>
  );
}

function HomePageWorkbench({
  data,
  summary,
  smartInsights,
  timeline,
  timeRemaining,
  onTaskDone,
  onAddMemo,
  onOpenPage,
}: {
  data: AppData;
  summary: ReturnType<typeof getDashboardSummary>;
  smartInsights: ReturnType<typeof getSmartInsights>;
  timeline: ReturnType<typeof getHomeTimeline>;
  timeRemaining: ReturnType<typeof getTimeRemainingPercentages>;
  onTaskDone: (id: string, done: boolean) => void;
  onAddMemo: (content: string) => void;
  onOpenPage: (page: PageId) => void;
}) {
  const [memo, setMemo] = useState("");
  const visibleTasks = data.tasks.filter((task) => task.plannedDate === today).slice(0, 4);
  const attentionTasks = summary.highPriorityOpenTasks.slice(0, 3);
  const progress = summary.todayTaskCount
    ? Math.round((summary.doneTaskCount / summary.todayTaskCount) * 100)
    : 0;
  const focusItems = timeline.filter((item) => item.module === "today");
  const currentFocus = focusItems[0] ?? timeline[0];
  const nextFocus = focusItems[1] ?? timeline.find((item) => item.id !== currentFocus?.id);
  const focusDistribution = [
    { label: "计划", value: data.tasks.filter((task) => task.plannedDate === today).length },
    { label: "训练", value: data.workouts.filter((item) => item.date === today).length },
    { label: "饮食", value: data.meals.filter((item) => item.date === today).length },
    { label: "娱乐", value: summary.activeEntertainment.length },
  ];
  const maxFocusDistribution = Math.max(1, ...focusDistribution.map((item) => item.value));

  return (
    <section className="dashboard-page page-stack">
      <header className="dashboard-hero">
        <div>
          <span className="eyebrow">今天</span>
          <h2>从最重要的一件事开始</h2>
          <p>把计划、身体、饮食和休息放在同一个本地工作台里</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onOpenPage("today")}>
          <Plus size={18} />
          添加今日计划
        </button>
      </header>

      <section className="overview-strip" aria-label="今日进度">
        <div>
          <span>今日进度</span>
          <strong>{progress}<small>%</small></strong>
        </div>
        <div className="overview-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div>
          <span>已完成</span>
          <strong>{summary.doneTaskCount}<small> / {summary.todayTaskCount}</small></strong>
        </div>
        <div>
          <span>待处理</span>
          <strong>{summary.openTaskCount}</strong>
        </div>
      </section>

      <section className="panel focus-panel">
        <div className="focus-main">
          <span className="eyebrow">当前焦点</span>
          {currentFocus ? (
            <>
              <h2>{currentFocus.title}</h2>
              <p>
                {currentFocus.timeLabel} · 来自 {currentFocus.module}
              </p>
            </>
          ) : (
            <>
              <h2>今天还没有安排</h2>
              <p>先安排一个具体行动，让今天开始运转</p>
            </>
          )}
          <div className="focus-actions">
            <button type="button" className="primary-button" onClick={() => onOpenPage("today")}>
              <ListPlus size={17} />
              添加今日计划
            </button>
            <button type="button" className="secondary-button" onClick={() => onOpenPage("fitness")}>
              <Dumbbell size={17} />
              记录训练
            </button>
            <button type="button" className="secondary-button" onClick={() => onOpenPage("diet")}>
              <Utensils size={17} />
              记录饮食
            </button>
          </div>
        </div>
        <div className="focus-side">
          <div className="next-focus">
            <span>下一件事</span>
            <strong>{nextFocus?.title ?? "先把第一件事写下来"}</strong>
            <small>{nextFocus ? nextFocus.timeLabel : "未安排时间"}</small>
          </div>
          <div className="focus-distribution" aria-label="今日记录分布">
            {focusDistribution.map((item) => (
              <div className="focus-distribution-row" key={item.label}>
                <span>{item.label}</span>
                <div><span style={{ width: `${(item.value / maxFocusDistribution) * 100}%` }} /></div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav className="dashboard-command-strip" aria-label="快速操作">
        <span>快速操作</span>
        <button type="button" onClick={() => onOpenPage("today")}><ListPlus size={17} />新建计划</button>
        <button type="button" onClick={() => onOpenPage("fitness")}><Dumbbell size={17} />记录训练</button>
        <button type="button" onClick={() => onOpenPage("diet")}><Utensils size={17} />记录饮食</button>
        <button type="button" onClick={() => onOpenPage("project")}><FolderPlus size={17} />打开项目</button>
      </nav>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>今日时间线</h2>
                <p className="section-caption">按开始时间排列今天要做的事</p>
              </div>
              <button type="button" onClick={() => onOpenPage("today")}>打开计划</button>
            </div>
            <div className="timeline-list">
              {timeline.length ? timeline.map((item) => (
                <article className="timeline-item" key={`${item.module}-${item.id}`}>
                  <time>{item.timeLabel}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.module}</span>
                  </div>
                </article>
              )) : <p className="empty-text">今天还没有可排序的记录</p>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>今日重点</h2>
                <p className="section-caption">完成一件，再决定下一件</p>
              </div>
            </div>
            <div className="item-list">
              {visibleTasks.length ? visibleTasks.map((task) => (
                <label className="list-row" key={task.id}>
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={(event) => onTaskDone(task.id, event.target.checked)}
                  />
                  <span>{task.title}</span>
                  <small>{priorityLabel(task.priority)}</small>
                </label>
              )) : <p className="empty-text">今天还没有任务</p>}
            </div>
          </section>
        </div>

        <aside className="dashboard-aside">
          <section className="panel memo-section">
            <div className="panel-heading">
              <div>
                <h2>快速备忘</h2>
                <p className="section-caption">先记下来，之后再整理</p>
              </div>
            </div>
            <form
              className="memo-pad"
              onSubmit={(event) => {
                event.preventDefault();
                if (memo.trim()) {
                  onAddMemo(memo);
                  setMemo("");
                }
              }}
            >
              <textarea
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="记下一闪而过的想法"
                rows={4}
              />
              <button type="submit" className="primary-button">
                <Plus size={17} />
                保存备忘
              </button>
            </form>
            <div className="item-list">
              {summary.recentMemos.map((item) => (
                <p className="compact-item" key={item.id}>{item.content}</p>
              ))}
              {!summary.recentMemos.length ? <p className="empty-text">暂无备忘</p> : null}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>需要关注</h2>
                <p className="section-caption">优先级高且还没有完成的事项</p>
              </div>
            </div>
            <div className="attention-list">
              {attentionTasks.length ? attentionTasks.map((task) => (
                <button type="button" className="attention-item" key={task.id} onClick={() => onOpenPage("today")}>
                  <span className="attention-mark" />
                  <span>{task.title}</span>
                  <small>{task.startTime}</small>
                </button>
              )) : <p className="empty-text">目前没有紧急事项</p>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>剩余时间</h2>
                <p className="section-caption">给今天留一点余地</p>
              </div>
            </div>
            <div className="time-remaining-list">
              <TimeRemainingRow label="今日" value={timeRemaining.day} />
              <TimeRemainingRow label="本周" value={timeRemaining.week} />
              <TimeRemainingRow label="本月" value={timeRemaining.month} />
              <TimeRemainingRow label="本年" value={timeRemaining.year} />
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>模块摘要</h2>
            <p className="section-caption">只看最近真正需要留意的内容</p>
          </div>
        </div>
        <div className="summary-grid">
          <button type="button" className="summary-tile" onClick={() => onOpenPage("fitness")}>
            <span className="summary-tile-icon"><Dumbbell size={18} /></span>
            <span><strong>健身计划</strong><small>{summary.todayWorkout ? "今天已记录训练" : "今天还没有训练"}</small></span>
          </button>
          <button type="button" className="summary-tile" onClick={() => onOpenPage("diet")}>
            <span className="summary-tile-icon"><Utensils size={18} /></span>
            <span><strong>饮食计划</strong><small>{summary.todayWaterCups} 杯水 · {summary.todayMealCount} 条记录</small></span>
          </button>
          <button type="button" className="summary-tile" onClick={() => onOpenPage("fun")}>
            <span className="summary-tile-icon"><Gamepad2 size={18} /></span>
            <span><strong>游戏娱乐</strong><small>{summary.activeEntertainment.length} 个项目进行中</small></span>
          </button>
          <button type="button" className="summary-tile" onClick={() => onOpenPage("project")}>
            <span className="summary-tile-icon"><FolderPlus size={18} /></span>
            <span><strong>自定义项目</strong><small>{summary.recentCustomProjects.length} 个项目最近更新</small></span>
          </button>
        </div>
      </section>

      <section className="panel ai-panel">
        <div className="panel-heading">
          <div>
            <h2>今日复盘提示</h2>
            <p className="section-caption">根据你保存在本机的数据生成</p>
          </div>
        </div>
        <div className="smart-insight">
          <strong>{smartInsights.headline}</strong>
          <p>{smartInsights.summary}</p>
        </div>
        <div className="smart-signal-list">
          {smartInsights.signals.map((signal) => (
            <div key={signal.label} className="smart-signal">
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </div>
          ))}
        </div>
        <div className="smart-recommendations">
          {smartInsights.recommendations.map((item) => (
            <p key={item} className="smart-recommendation">{item}</p>
          ))}
        </div>
      </section>
    </section>
  );
}

function HomePage({
  data,
  summary,
  smartInsights,
  timeline,
  timeRemaining,
  onTaskDone,
  onAddMemo,
  onOpenPage,
}: {
  data: AppData;
  summary: ReturnType<typeof getDashboardSummary>;
  smartInsights: ReturnType<typeof getSmartInsights>;
  timeline: ReturnType<typeof getHomeTimeline>;
  timeRemaining: ReturnType<typeof getTimeRemainingPercentages>;
  onTaskDone: (id: string, done: boolean) => void;
  onAddMemo: (content: string) => void;
  onOpenPage: (page: PageId) => void;
}) {
  const [memo, setMemo] = useState("");
  const visibleTasks = data.tasks.filter((task) => task.plannedDate === today).slice(0, 4);

  return (
    <section className="page-grid">
      <button type="button" className="stat-card" onClick={() => onOpenPage("today")}>
        <span>今日计划</span>
        <strong>
          {summary.doneTaskCount} / {summary.todayTaskCount}
        </strong>
        <p>{summary.openTaskCount} 项未完成</p>
      </button>
      <button type="button" className="stat-card" onClick={() => onOpenPage("fitness")}>
        <span>健身状态</span>
        <strong>{summary.todayWorkout ? "已记录" : "未训练"}</strong>
        <p>{summary.latestWorkout?.name ?? "暂无训练记录"}</p>
      </button>
      <button type="button" className="stat-card" onClick={() => onOpenPage("diet")}>
        <span>饮食饮水</span>
        <strong>{summary.todayWaterCups} 杯</strong>
        <p>今日 {summary.todayMealCount} 条餐食记录</p>
      </button>

      <section className="panel wide-panel">
        <div className="panel-heading">
          <h2>今日重点</h2>
          <button type="button" onClick={() => onOpenPage("today")}>
            进入计划
          </button>
        </div>
        <div className="item-list">
          {visibleTasks.length ? (
            visibleTasks.map((task) => (
              <label className="list-row" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={(event) => onTaskDone(task.id, event.target.checked)}
                />
                <span>{task.title}</span>
                <small>{priorityLabel(task.priority)}</small>
              </label>
            ))
          ) : (
            <p className="empty-text">今天还没有任务</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>快速备忘</h2>
        </div>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (memo.trim()) {
              onAddMemo(memo);
              setMemo("");
            }
          }}
        >
          <input
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="记录一个临时想法"
          />
          <button type="submit" aria-label="新增备忘">
            <Plus size={18} />
          </button>
        </form>
        <div className="item-list">
          {summary.recentMemos.map((item) => (
            <p className="compact-item" key={item.id}>
              {item.content}
            </p>
          ))}
          {!summary.recentMemos.length ? <p className="empty-text">暂无备忘</p> : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>AI 总结</h2>
        </div>
        <div className="smart-insight">
          <strong>{smartInsights.headline}</strong>
          <p>{smartInsights.summary}</p>
        </div>
        <div className="smart-signal-list">
          {smartInsights.signals.map((signal) => (
            <div key={signal.label} className="smart-signal">
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </div>
          ))}
        </div>
        <div className="smart-recommendations">
          {smartInsights.recommendations.map((item) => (
            <p key={item} className="smart-recommendation">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>模块摘要</h2>
        </div>
        <div className="summary-list">
          <button type="button" onClick={() => onOpenPage("fun")}>
            游戏娱乐 <span>{summary.activeEntertainment.length} 个进行中</span>
          </button>
          <button type="button" onClick={() => onOpenPage("project")}>
            自定义项目 <span>{summary.recentCustomProjects.length} 个最近更新</span>
          </button>
        </div>
      </section>
      <section className="panel wide-panel">
        <div className="panel-heading">
          <h2>今日时间线</h2>
        </div>
        <div className="timeline-list">
          {timeline.length ? (
            timeline.map((item) => (
              <article className="timeline-item" key={`${item.module}-${item.id}`}>
                <time>{item.timeLabel}</time>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.module}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-text">今天还没有可排序的记录</p>
          )}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>剩余时间</h2>
        </div>
        <div className="time-remaining-list">
          <TimeRemainingRow label="今日" value={timeRemaining.day} />
          <TimeRemainingRow label="本周" value={timeRemaining.week} />
          <TimeRemainingRow label="本月" value={timeRemaining.month} />
          <TimeRemainingRow label="本年" value={timeRemaining.year} />
        </div>
      </section>
    </section>
  );
}

function CalendarPage({ data }: { data: AppData }) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const month = useMemo(() => getMonthCalendar(data, cursor), [data, cursor]);
  const selectedDay =
    month.days.find((day) => day.date === selectedDate) ??
    month.days.find((day) => day.isToday) ??
    month.days[0];

  return (
    <section className="page-stack">
      <section className="panel">
        <div className="panel-heading">
          <h2>{month.label}</h2>
          <div className="row-actions">
            <button
              type="button"
              onClick={() =>
                setCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
            >
              上月
            </button>
            <button
              type="button"
              onClick={() =>
                setCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
            >
              下月
            </button>
          </div>
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {["一", "二", "三", "四", "五", "六", "日"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {month.days.map((day) => (
            <button
              key={day.date}
              type="button"
              className={[
                "calendar-day",
                day.isCurrentMonth ? "" : "is-outside",
                day.isToday ? "is-today" : "",
                selectedDay?.date === day.date ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSelectedDate(day.date)}
            >
              <strong>{day.dayOfMonth}</strong>
              <span>{day.summary}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>当天明细</h2>
        </div>
        {selectedDay ? (
          <div className="calendar-detail">
            <strong>{selectedDay.date}</strong>
            <p>{selectedDay.summary}</p>
            <div className="smart-signal-list">
              <div className="smart-signal">
                <span>任务</span>
                <strong>{selectedDay.counts.tasks}</strong>
              </div>
              <div className="smart-signal">
                <span>训练</span>
                <strong>{selectedDay.counts.workouts}</strong>
              </div>
              <div className="smart-signal">
                <span>饮食</span>
                <strong>{selectedDay.counts.meals}</strong>
              </div>
              <div className="smart-signal">
                <span>备忘</span>
                <strong>{selectedDay.counts.memos}</strong>
              </div>
              <div className="smart-signal">
                <span>娱乐</span>
                <strong>{selectedDay.counts.entertainments}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}

function StatsPage({ data }: { data: AppData }) {
  const stats = useMemo(() => getStatsOverview(data, today), [data]);
  const nutrition = useMemo(() => getNutritionOverview(data, today), [data]);
  const maxWeeklyValue = Math.max(1, ...stats.weeklyActivity.map((point) => point.value));

  return (
    <section className="page-stack">
      <section className="panel">
        <div className="panel-heading">
          <h2>总览</h2>
        </div>
        <div className="smart-signal-list">
          <div className="smart-signal">
            <span>总记录</span>
            <strong>{stats.totalRecords}</strong>
          </div>
          <div className="smart-signal">
            <span>今日完成率</span>
            <strong>{stats.taskCompletionRate}%</strong>
          </div>
          <div className="smart-signal">
            <span>今日饮水</span>
            <strong>{stats.todayWaterCups} 杯</strong>
          </div>
        </div>
        <p className="smart-recommendation">{stats.recommendation}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>最近 7 天活动</h2>
        </div>
        <div className="bar-chart">
          {stats.weeklyActivity.map((point) => (
            <div key={point.date} className="bar-chart-row">
              <span>{point.label}</span>
              <div className="bar-chart-track">
                <div
                  className="bar-chart-fill"
                  style={{ width: `${(point.value / maxWeeklyValue) * 100}%` }}
                />
              </div>
              <strong>{point.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>模块占比</h2>
        </div>
        <div className="module-breakdown">
          {stats.moduleBreakdown.map((item) => {
            const total = Math.max(1, stats.totalRecords);
            const width = Math.round((item.value / total) * 1000) / 10;
            return (
              <div key={item.label} className="module-breakdown-row">
                <span>{item.label}</span>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill" style={{ width: `${width}%` }} />
                </div>
                <strong>{width}%</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>营养与运动估算</h2>
        </div>
        <div className="smart-signal-list">
          <div className="smart-signal">
            <span>摄入热量</span>
            <strong>{nutrition.intake.calories} kcal</strong>
          </div>
          <div className="smart-signal">
            <span>运动消耗</span>
            <strong>{nutrition.burnedCalories} kcal</strong>
          </div>
          <div className="smart-signal">
            <span>净热量</span>
            <strong>{nutrition.netCalories} kcal</strong>
          </div>
          <div className="smart-signal">
            <span>训练时长</span>
            <strong>{nutrition.workoutMinutes} 分钟</strong>
          </div>
        </div>
        <div className="macro-grid">
          <div>
            <span>蛋白质</span>
            <strong>{nutrition.intake.protein} g</strong>
          </div>
          <div>
            <span>碳水</span>
            <strong>{nutrition.intake.carbs} g</strong>
          </div>
          <div>
            <span>脂肪</span>
            <strong>{nutrition.intake.fat} g</strong>
          </div>
        </div>
        <p className="muted">{nutrition.note}</p>
      </section>
    </section>
  );
}

function TimeRemainingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="time-remaining-row">
      <span>{label}</span>
      <div className="time-progress" aria-label={`${label}剩余 ${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

function TodayPage({
  data,
  filter,
  onFilter,
  onAdd,
  onUpdate,
  onDone,
  onDelete,
}: {
  data: AppData;
  filter: "all" | TaskStatus;
  onFilter: (value: "all" | TaskStatus) => void;
  onAdd: (input: Parameters<typeof addTask>[1]) => void;
  onUpdate: (id: string, patch: Parameters<typeof updateTask>[2]) => void;
  onDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [plannedDate, setPlannedDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [note, setNote] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const tasks = filterTasks(data.tasks, filter);
  const editingTask = tasks.find((task) => task.id === editingTaskId);

  function resetTaskForm() {
    setEditingTaskId(null);
    setTitle("");
    setPriority("medium");
    setPlannedDate(today);
    setStartTime("09:00");
    setEstimatedMinutes(30);
    setNote("");
  }

  function beginEdit(task: (typeof data.tasks)[number]) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setPriority(task.priority);
    setPlannedDate(task.plannedDate);
    setStartTime(task.startTime);
    setEstimatedMinutes(task.estimatedMinutes);
    setNote(task.note);
  }

  return (
    <section className="page-stack">
      <form
        className="panel form-panel"
        onSubmit={(event) => {
          event.preventDefault();
          if (editingTaskId) {
            onUpdate(editingTaskId, {
              title,
              priority,
              plannedDate,
              startTime,
              estimatedMinutes,
              note,
            });
          } else {
            onAdd({ title, priority, plannedDate, startTime, estimatedMinutes, note });
          }
          resetTaskForm();
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="任务标题"
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
          aria-label="开始时间"
        />
        <input
          type="number"
          min={1}
          value={estimatedMinutes}
          onChange={(event) => setEstimatedMinutes(Number(event.target.value))}
          required
          aria-label="预计分钟数"
        />
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}优先级
            </option>
          ))}
        </select>
        <input
          type="date"
          value={plannedDate}
          onChange={(event) => setPlannedDate(event.target.value)}
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="备注说明"
        />
        <button type="submit">
          <Plus size={18} />
          {editingTask ? "保存修改" : "新增"}
        </button>
        {editingTask ? (
          <button type="button" className="secondary-button" onClick={resetTaskForm}>
            取消编辑
          </button>
        ) : null}
      </form>
      <div className="filter-row">
        {(["all", "todo", "doing", "done"] as const).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={filter === item}
            onClick={() => onFilter(item)}
          >
            {item === "all" ? "全部" : statusLabel(item)}
          </button>
        ))}
      </div>
      <RecordList
        empty="暂无任务"
        items={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          meta: `${task.startTime ?? "未设时间"} · ${task.estimatedMinutes ?? 0} 分钟 · ${statusLabel(task.status)} · ${priorityLabel(task.priority)} · ${task.note || "无备注"}`,
          done: task.status === "done",
          onToggle: (done) => onDone(task.id, done),
          onEdit: () => beginEdit(task),
          onDelete: () => {
            if (editingTaskId === task.id) {
              resetTaskForm();
            }
            onDelete(task.id);
          },
        }))}
      />
    </section>
  );
}

function FitnessPage({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: {
  data: AppData;
  onAdd: (input: Parameters<typeof addWorkout>[1]) => void;
  onUpdate: (id: string, patch: Parameters<typeof updateWorkout>[2]) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<WorkoutType>("strength");
  const [minutes, setMinutes] = useState(30);

  return (
    <ModulePage
      form={
        <form
          className="panel form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onAdd({ name, type, minutes, date: today });
            setName("");
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="训练名称"
            required
          />
          <select value={type} onChange={(event) => setType(event.target.value as WorkoutType)}>
            <option value="strength">力量</option>
            <option value="cardio">有氧</option>
            <option value="stretch">拉伸</option>
            <option value="other">其他</option>
          </select>
          <input
            type="number"
            min={0}
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
          />
          <button type="submit">
            <Plus size={18} />
            新增
          </button>
        </form>
      }
      empty="暂无训练记录"
      items={data.workouts.map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.date} · ${item.minutes} 分钟 · ${item.completed ? "已完成" : "计划中"}`,
        done: item.completed,
        onToggle: (done) => onUpdate(item.id, { completed: done }),
        onEdit: () => {
          const name = prompt("编辑训练名称", item.name);
          if (name) onUpdate(item.id, { name });
        },
        onDelete: () => onDelete(item.id),
      }))}
    />
  );
}

function DietPage({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: {
  data: AppData;
  onAdd: (input: Parameters<typeof addMeal>[1]) => void;
  onUpdate: (id: string, patch: Parameters<typeof updateMeal>[2]) => void;
  onDelete: (id: string) => void;
}) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<MealType>("breakfast");
  const [waterCups, setWaterCups] = useState(1);

  return (
    <ModulePage
      form={
        <form
          className="panel form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onAdd({ content, type, waterCups, date: today });
            setContent("");
          }}
        >
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="餐食内容"
            required
          />
          <select value={type} onChange={(event) => setType(event.target.value as MealType)}>
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="snack">加餐</option>
          </select>
          <input
            type="number"
            min={0}
            value={waterCups}
            onChange={(event) => setWaterCups(Number(event.target.value))}
          />
          <button type="submit">
            <Plus size={18} />
            新增
          </button>
        </form>
      }
      empty="暂无饮食记录"
      items={data.meals.map((item) => ({
        id: item.id,
        title: item.content,
        meta: `${item.date} · ${item.type} · 饮水 ${item.waterCups} 杯`,
        onEdit: () => {
          const content = prompt("编辑餐食内容", item.content);
          if (content) onUpdate(item.id, { content });
        },
        onDelete: () => onDelete(item.id),
      }))}
    />
  );
}

function FunPage({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: {
  data: AppData;
  onAdd: (input: Parameters<typeof addEntertainment>[1]) => void;
  onUpdate: (id: string, patch: Parameters<typeof updateEntertainment>[2]) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<EntertainmentType>("game");
  const [status, setStatus] = useState<EntertainmentStatus>("wishlist");

  return (
    <ModulePage
      form={
        <form
          className="panel form-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onAdd({ name, type, status });
            setName("");
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="娱乐计划名称"
            required
          />
          <select value={type} onChange={(event) => setType(event.target.value as EntertainmentType)}>
            <option value="game">游戏</option>
            <option value="movie">影视</option>
            <option value="reading">阅读</option>
            <option value="other">其他</option>
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as EntertainmentStatus)}
          >
            <option value="wishlist">想玩</option>
            <option value="active">进行中</option>
            <option value="done">已完成</option>
          </select>
          <button type="submit">
            <Plus size={18} />
            新增
          </button>
        </form>
      }
      empty="暂无娱乐计划"
      items={data.entertainments.map((item) => ({
        id: item.id,
        title: item.name,
        meta: `${item.type} · ${item.status}`,
        done: item.status === "done",
        onToggle: (done) => onUpdate(item.id, { status: done ? "done" : "active" }),
        onEdit: () => {
          const name = prompt("编辑娱乐计划名称", item.name);
          if (name) onUpdate(item.id, { name });
        },
        onDelete: () => onDelete(item.id),
      }))}
    />
  );
}

function ProjectPage({
  selectedProject,
  onUpdateProject,
  onDeleteProject,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: {
  selectedProject?: AppData["customProjects"][number];
  onUpdateProject: (id: string, patch: Parameters<typeof updateCustomProject>[2]) => void;
  onDeleteProject: (id: string) => void;
  onAddItem: (projectId: string, input: Parameters<typeof addCustomItem>[2]) => void;
  onUpdateItem: (
    projectId: string,
    itemId: string,
    patch: Parameters<typeof updateCustomItem>[3],
  ) => void;
  onDeleteItem: (projectId: string, itemId: string) => void;
}) {
  const [itemTitle, setItemTitle] = useState("");

  return (
    <section className="project-page">
      <div className="panel">
        {selectedProject ? (
          <>
            <div className="panel-heading">
              <h2>{selectedProject.name}</h2>
              <div className="row-actions">
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt("编辑项目名称", selectedProject.name);
                    if (name) onUpdateProject(selectedProject.id, { name });
                  }}
                >
                  编辑
                </button>
                <button type="button" onClick={() => onDeleteProject(selectedProject.id)}>
                  删除
                </button>
              </div>
            </div>
            <form
              className="inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                onAddItem(selectedProject.id, { title: itemTitle });
                setItemTitle("");
              }}
            >
              <input
                value={itemTitle}
                onChange={(event) => setItemTitle(event.target.value)}
                placeholder="新增条目"
                required
              />
              <button type="submit" aria-label="新增条目">
                <Plus size={18} />
              </button>
            </form>
            <RecordList
              empty="暂无项目条目"
              items={selectedProject.items.map((item) => ({
                id: item.id,
                title: item.title,
                meta: item.completed ? "已完成" : "未完成",
                done: item.completed,
                onToggle: (done) =>
                  onUpdateItem(selectedProject.id, item.id, { completed: done }),
                onEdit: () => {
                  const title = prompt("编辑条目标题", item.title);
                  if (title) onUpdateItem(selectedProject.id, item.id, { title });
                },
                onDelete: () => onDeleteItem(selectedProject.id, item.id),
              }))}
            />
          </>
        ) : (
          <p className="empty-text">先在左侧快速新增一个项目</p>
        )}
      </div>
    </section>
  );
}

function SettingsPage({
  data,
  message,
  theme,
  reminderItems,
  notificationPermission,
  onEnableNotifications,
  onSelectTheme,
  onExport,
  onImport,
  onClear,
}: {
  data: AppData;
  message: string;
  theme: ThemeId;
  reminderItems: ReturnType<typeof getReminderItems>;
  notificationPermission: NotificationPermission | "unsupported";
  onEnableNotifications: () => void | Promise<void>;
  onSelectTheme: (theme: ThemeId) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClear: () => void;
}) {
  const totalRecords =
    data.tasks.length +
    data.memos.length +
    data.workouts.length +
    data.meals.length +
    data.entertainments.length +
    data.customProjects.length;

  return (
    <section className="page-grid settings-grid">
      <div className="panel">
        <h2>本地数据</h2>
        <p className="muted">
          本网站无需登录，任何能打开当前浏览器的人，都可以看到这里保存的数据
        </p>
        <p className="muted">当前包含 {totalRecords} 条顶层记录</p>
      </div>
      <div className="panel">
        <h2>主题皮肤</h2>
        <p className="muted">切换整体配色方案，设置会保存在当前浏览器</p>
        <div className="theme-grid">
          {themeChoices.map((choice) => (
            <button
              type="button"
              key={choice.id}
              className={theme === choice.id ? "theme-option is-active" : "theme-option"}
              aria-pressed={theme === choice.id}
              onClick={() => onSelectTheme(choice.id)}
            >
              <strong>{choice.label}</strong>
              <span>{choice.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>提醒系统</h2>
        <p className="muted">
          {notificationPermission === "unsupported"
            ? "当前浏览器不支持通知"
            : notificationPermission === "granted"
              ? "已允许浏览器通知，系统会在事项到点前弹出提醒"
              : "浏览器通知尚未开启"}
        </p>
        <div className="settings-actions">
          <button type="button" onClick={onEnableNotifications}>
            启用通知
          </button>
        </div>
        <div className="reminder-list">
          {reminderItems.length ? (
            reminderItems.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="reminder-item">
                <strong>{item.title}</strong>
                <span>
                  {item.timeLabel} · {item.kind}
                </span>
              </div>
            ))
          ) : (
            <p className="empty-text">暂无待提醒事项</p>
          )}
        </div>
      </div>
      <div className="panel">
        <h2>备份与恢复</h2>
        <p className="muted">数据只保存在当前浏览器，换设备或换浏览器前，请先导出 JSON</p>
        <div className="settings-actions">
          <button type="button" onClick={onExport}>
            <Download size={18} />
            导出 JSON
          </button>
          <label className="import-button">
            <Upload size={18} />
            导入 JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImport(file);
                  event.target.value = "";
                }
              }}
            />
          </label>
          <button type="button" className="danger-button" onClick={onClear}>
            <Trash2 size={18} />
            清空本地数据
          </button>
        </div>
        {message ? <p className="error-text">{message}</p> : null}
      </div>
    </section>
  );
}

function ModulePage({
  form,
  items,
  empty,
}: {
  form: ReactElement;
  items: Parameters<typeof RecordList>[0]["items"];
  empty: string;
}) {
  return (
    <section className="page-stack">
      {form}
      <RecordList items={items} empty={empty} />
    </section>
  );
}

function RecordList({
  items,
  empty,
}: {
  items: Array<{
    id: string;
    title: string;
    meta: string;
    done?: boolean;
    onToggle?: (done: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }>;
  empty: string;
}) {
  if (!items.length) {
    return (
      <section className="panel">
        <p className="empty-text">{empty}</p>
      </section>
    );
  }

  return (
    <section className="panel item-list">
      {items.map((item) => (
        <article className="record-row" key={item.id}>
          {item.onToggle ? (
            <input
              type="checkbox"
              checked={item.done ?? false}
              onChange={(event) => item.onToggle?.(event.target.checked)}
              aria-label={`${item.title} 完成状态`}
            />
          ) : (
            <span className="record-dot" />
          )}
          <div>
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </div>
          <div className="row-actions">
            <button type="button" onClick={item.onEdit}>
              编辑
            </button>
            <button type="button" onClick={item.onDelete}>
              删除
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

