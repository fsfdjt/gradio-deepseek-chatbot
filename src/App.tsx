import {
  CheckSquare,
  Download,
  Dumbbell,
  FolderPlus,
  Gamepad2,
  Home,
  Plus,
  Settings,
  Trash2,
  Upload,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactElement } from "react";
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

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [data, setData] = useState<AppData>(() => createEmptyData());
  const [isHydrated, setIsHydrated] = useState(false);
  const [message, setMessage] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | TaskStatus>("all");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    loadAppData()
      .then((stored) => {
        setData(stored ?? createEmptyData());
        setIsHydrated(true);
      })
      .catch(() => {
        setMessage("读取本地 IndexedDB 数据失败，已进入空白数据状态。");
        setIsHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveAppData(data).catch(() => {
      setMessage("保存本地数据失败，请检查浏览器 IndexedDB 权限。");
    });
  }, [data, isHydrated]);

  const summary = useMemo(() => getDashboardSummary(data, today), [data]);
  const timeline = useMemo(() => getHomeTimeline(data, today), [data]);
  const selectedProject =
    data.customProjects.find((project) => project.id === selectedProjectId) ??
    data.customProjects[0];
  const currentPage =
    activePage === "project"
      ? {
          label: selectedProject?.name ?? "项目",
          description: selectedProject
            ? "管理这个项目里的清单条目。"
            : "从左侧快速新增一个项目后开始管理。",
        }
      : (pages.find((page) => page.id === activePage) ?? pages[0]);

  function mutate(updater: (value: AppData) => AppData) {
    setData((current) => updater(current));
  }

  function handleQuickAddProject() {
    const name = prompt("新增项目名称");
    if (!name?.trim()) {
      return;
    }

    let createdProjectId = "";
    setData((current) => {
      const next = addCustomProject(current, { name: name.trim() });
      createdProjectId = next.customProjects[0]?.id ?? "";
      return next;
    });
    setSelectedProjectId(createdProjectId);
    setActivePage("project");
  }

  if (!isHydrated) {
    return <main className="auth-screen">正在读取本地数据...</main>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Home size={18} />
          </span>
          <span>Work Life Hub</span>
        </div>
        <button type="button" className="quick-add-project" onClick={handleQuickAddProject}>
          <Plus size={18} />
          快速新增项目
        </button>
        <nav className="main-nav" aria-label="主导航">
          {pages.map((page) => {
            const Icon = icons[page.id];
            return (
              <button
                key={page.id}
                type="button"
                aria-pressed={activePage === page.id}
                onClick={() => setActivePage(page.id)}
              >
                <Icon size={18} />
                {page.label}
              </button>
            );
          })}
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

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{currentPage.label}</h1>
            <p>{currentPage.description}</p>
          </div>
          <p className="local-note">数据仅保存在当前浏览器</p>
        </header>

        {message ? <p className="app-message">{message}</p> : null}

        {activePage === "home" ? (
          <HomePage
            data={data}
            summary={summary}
            timeline={timeline}
            onTaskDone={(id, done) => mutate((value) => setTaskDone(value, id, done))}
            onAddMemo={(content) => mutate((value) => addMemo(value, { content }))}
            onOpenPage={setActivePage}
          />
        ) : null}
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
            data={data}
            selectedProject={selectedProject}
            onSelect={setSelectedProjectId}
            onAddProject={(input) => mutate((value) => addCustomProject(value, input))}
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
              setMessage("已导出 JSON 备份。");
            }}
            onImport={async (file) => {
              try {
                const backup = parseBackup(await file.text());
                setData(backup.data);
                await saveAppData(backup.data);
                setMessage("已导入 JSON 备份。");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "导入失败。");
              }
            }}
            onClear={async () => {
              if (confirm("确定清空全部本地数据吗？此操作不可恢复。")) {
                await clearAppData();
                setData(createEmptyData());
                setSelectedProjectId("");
                setMessage("已清空当前浏览器中的本地数据。");
              }
            }}
          />
        ) : null}
      </main>
    </div>
  );
}

function HomePage({
  data,
  summary,
  timeline,
  onTaskDone,
  onAddMemo,
  onOpenPage,
}: {
  data: AppData;
  summary: ReturnType<typeof getDashboardSummary>;
  timeline: ReturnType<typeof getHomeTimeline>;
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
            <p className="empty-text">今天还没有任务。</p>
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
          {!summary.recentMemos.length ? <p className="empty-text">暂无备忘。</p> : null}
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
            <p className="empty-text">今天还没有可排序的记录。</p>
          )}
        </div>
      </section>
    </section>
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
  const tasks = filterTasks(data.tasks, filter);

  return (
    <section className="page-stack">
      <form
        className="panel form-panel"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd({ title, priority, plannedDate });
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="任务标题"
          required
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
        <button type="submit">
          <Plus size={18} />
          新增
        </button>
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
        empty="暂无任务。"
        items={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          meta: `${statusLabel(task.status)} · ${priorityLabel(task.priority)} · ${task.plannedDate}`,
          done: task.status === "done",
          onToggle: (done) => onDone(task.id, done),
          onEdit: () => {
            const nextTitle = prompt("编辑任务标题", task.title);
            if (nextTitle) onUpdate(task.id, { title: nextTitle });
          },
          onDelete: () => onDelete(task.id),
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
      empty="暂无训练记录。"
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
      empty="暂无饮食记录。"
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
      empty="暂无娱乐计划。"
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
  data,
  selectedProject,
  onSelect,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: {
  data: AppData;
  selectedProject?: AppData["customProjects"][number];
  onSelect: (id: string) => void;
  onAddProject: (input: Parameters<typeof addCustomProject>[1]) => void;
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
  const [projectName, setProjectName] = useState("");
  const [itemTitle, setItemTitle] = useState("");

  return (
    <section className="custom-grid">
      <div className="panel">
        <div className="panel-heading">
          <h2>项目列表</h2>
        </div>
        <div className="project-list">
          {data.customProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              aria-pressed={selectedProject?.id === project.id}
              onClick={() => onSelect(project.id)}
            >
              {project.name}
              <span>{project.items.filter((item) => !item.completed).length} 未完成</span>
            </button>
          ))}
          {!data.customProjects.length ? <p className="empty-text">左侧快速新增一个项目。</p> : null}
        </div>
      </div>
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
              empty="暂无项目条目。"
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
          <p className="empty-text">先创建一个自定义项目。</p>
        )}
      </div>
    </section>
  );
}

function SettingsPage({
  data,
  message,
  onExport,
  onImport,
  onClear,
}: {
  data: AppData;
  message: string;
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
          本网站无需登录。任何能打开当前浏览器的人，都可以看到这里保存的数据。
        </p>
        <p className="muted">当前包含 {totalRecords} 条顶层记录。</p>
      </div>
      <div className="panel">
        <h2>备份与恢复</h2>
        <p className="muted">数据只保存在当前浏览器。换设备或换浏览器前，请先导出 JSON。</p>
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
