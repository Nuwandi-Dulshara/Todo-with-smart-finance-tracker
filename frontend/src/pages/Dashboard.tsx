
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  LayoutDashboard,
  ListTodo,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Settings2,
  ShieldCheck,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import "./Dashboard.css";
import { dateKey, subscribeLocalDate, sumAmounts, subtractAmounts } from "../lib/dashboardUtils";
import {
  dashboardRequest, DashboardApiError, defaultWidgets,
  type DashboardData, type DashboardUser, type Task, type TaskPriority,
  type Transaction, type TransactionType, type WidgetKey, type WidgetSettings,
} from "../lib/dashboardApi";

/* =========================================================
   TYPES
========================================================= */

type ModalType = "task" | "transaction" | "budget" | null;

/* =========================================================
   HELPERS
========================================================= */

const today = () => dateKey(new Date());

const offsetDate = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const sameMonth = (value: string, reference: string) =>
  value.slice(0, 7) === reference.slice(0, 7);

const isWithinLastDays = (value: string, days: number) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return date >= start && date <= end;
};

const priorityRank: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const widgetLabels: { key: WidgetKey; label: string }[] = [
  { key: "tasks", label: "Task overview" },
  { key: "finances", label: "Financial overview" },
  { key: "priorities", label: "Today's priorities" },
  { key: "transactions", label: "Latest transactions" },
  { key: "deadlines", label: "Upcoming deadlines" },
  { key: "activity", label: "Recent activity" },
  { key: "insights", label: "Insights and alerts" },
  { key: "weekly", label: "Weekly summary" },
  { key: "linked", label: "Task-related spending" },
];

function Brand() {
  return (
    <Link to="/" className="dash-brand" aria-label="Organix AI home">
      <span className="dash-brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <strong>
        Organix<span>AI</span>
      </strong>
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`dash-panel ${className}`}>
      <div className="dash-panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="dash-panel-action">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="dash-empty">
      <CheckCircle2 size={23} />
      <span>{text}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`dash-priority dash-priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const saveLock = useRef(false);
  const [currentDate, setCurrentDate] = useState(today);
  const [loadedMonth, setLoadedMonth] = useState<string | null>(null);
  const taskRequestKey = useRef<string | null>(null);
  const transactionRequestKey = useRef<string | null>(null);
  const currentMonth = currentDate.slice(0, 7);

  useEffect(() => subscribeLocalDate(setCurrentDate), []);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("organix-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [modal, setModal] = useState<ModalType>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetSettings>(defaultWidgets);

  const [taskForm, setTaskForm] = useState({
    title: "",
    category: "Work",
    priority: "Medium" as TaskPriority,
    dueDate: today(),
  });

  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    type: "expense" as TransactionType,
    category: "Other",
    date: today(),
    taskId: "",
  });

  const [budgetInput, setBudgetInput] = useState("0");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("organix-theme", theme);
    } catch {
      // Keep the selected theme during this session.
    }
  }, [theme]);

  useEffect(() => {
    document.title = "Dashboard | Organix AI";
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dashboardRequest<DashboardData>(`?month=${currentMonth}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setUser(data.user);
        setTasks(data.tasks);
        setTransactions(data.transactions);
        setMonthlyBudget(data.monthlyBudget);
        setLoadedMonth(currentMonth);
        setBudgetInput(String(data.monthlyBudget));
        setModal((current) => current === "budget" ? null : current);
        setWidgets(data.widgets);
        setLoadError("");
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof DashboardApiError && error.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setLoadError(error instanceof Error ? error.message : "Unable to load your workspace.");
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [currentMonth, navigate, reloadKey]);

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fullDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const monthlyTransactions = transactions.filter((transaction) =>
    sameMonth(transaction.date, currentDate)
  );

  const income = sumAmounts(monthlyTransactions.filter((item) => item.type === "income"));

  const expenses = sumAmounts(monthlyTransactions.filter((item) => item.type === "expense"));

  const balance = subtractAmounts(income, expenses);
  const remainingBudget = subtractAmounts(monthlyBudget, expenses);

  const budgetUsed =
    monthlyBudget > 0
      ? Math.min((expenses / monthlyBudget) * 100, 100)
      : expenses > 0
        ? 100
        : 0;

  const todayTasks = tasks.filter((task) => task.dueDate === currentDate);
  const todayCompleted = todayTasks.filter((task) => task.completed).length;

  const completionRate = todayTasks.length
    ? Math.round((todayCompleted / todayTasks.length) * 100)
    : 0;

  const topTasks = todayTasks
    .filter((task) => !task.completed)
    .sort(
      (a, b) =>
        priorityRank[a.priority] - priorityRank[b.priority]
    )
    .slice(0, 3);

  const overdueTasks = tasks
    .filter((task) => !task.completed && task.dueDate < currentDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcomingTasks = tasks
    .filter((task) => !task.completed && task.dueDate > currentDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const latestTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const linkedTransactions = monthlyTransactions.filter(
    (transaction) => transaction.type === "expense" && transaction.taskId
  );

  const linkedTotal = sumAmounts(linkedTransactions);

  const linkedSummary = tasks
    .map((task) => ({
      ...task,
      spending: sumAmounts(linkedTransactions.filter((transaction) => transaction.taskId === task.id)),
    }))
    .filter((task) => task.spending > 0)
    .sort((a, b) => b.spending - a.spending);

  const weekTasks = tasks.filter((task) =>
    isWithinLastDays(task.dueDate, 7)
  );
  const weekCompleted = weekTasks.filter((task) => task.completed).length;
  const weeklyCompletion = weekTasks.length
    ? Math.round((weekCompleted / weekTasks.length) * 100)
    : 0;

  const weekTransactions = transactions.filter((transaction) =>
    isWithinLastDays(transaction.date, 7)
  );
  const weeklySpent = sumAmounts(weekTransactions.filter((transaction) => transaction.type === "expense"));

  const weeklyIncome = sumAmounts(weekTransactions.filter((transaction) => transaction.type === "income"));

  const dailySpend = Array.from({ length: 7 }, (_, index) => {
    const date = offsetDate(index - 6);
    return {
      date,
      label: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      amount: sumAmounts(weekTransactions.filter((item) => item.type === "expense" && item.date === date)),
    };
  });

  const maximumDailySpend = Math.max(
    ...dailySpend.map((item) => item.amount),
    1
  );

  const activities = [
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      description: task.completed ? "Completed task" : "Task added",
      createdAt: task.createdAt,
      type: "task" as const,
    })),
    ...transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      title: transaction.title,
      description:
        transaction.type === "income"
          ? `Income recorded · ${formatMoney(transaction.amount)}`
          : `Expense recorded · ${formatMoney(transaction.amount)}`,
      createdAt: transaction.createdAt,
      type: transaction.type,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  function showNotice(message: string) {
    setNotice(message);
  }

  async function save(action: () => Promise<void>) {
    if (saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    setSaveError("");
    setNotice("");
    try {
      await action();
    } catch (error) {
      if (error instanceof DashboardApiError && error.status === 401) {
        navigate("/login", { replace: true });
      } else {
        setSaveError(error instanceof Error ? error.message : "Unable to save your changes.");
      }
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  }

  function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    void save(async () => {
      const updated = await dashboardRequest<Task>(`/tasks/${id}`, {
        method: "PATCH", body: { completed: !task.completed },
      });
      setTasks((current) => current.map((item) => item.id === id ? updated : item));
    });
  }

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.title.trim()) return;
    void save(async () => {
      taskRequestKey.current ??= crypto.randomUUID();
      const task = await dashboardRequest<Task>("/tasks", {
        method: "POST", body: taskForm, requestKey: taskRequestKey.current,
      });
      taskRequestKey.current = null;
      setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
      setTaskForm({ title: "", category: "Work", priority: "Medium", dueDate: today() });
      setModal(null);
      showNotice("Task added to your workspace.");
    });
  }

  function createTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(transactionForm.amount);
    if (!transactionForm.title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    void save(async () => {
      transactionRequestKey.current ??= crypto.randomUUID();
      const transaction = await dashboardRequest<Transaction>("/transactions", {
        method: "POST", requestKey: transactionRequestKey.current,
        body: {
          ...transactionForm, amount,
          taskId: transactionForm.type === "expense" && transactionForm.taskId ? transactionForm.taskId : null,
        },
      });
      transactionRequestKey.current = null;
      setTransactions((current) => [transaction, ...current.filter((item) => item.id !== transaction.id)]);
      setTransactionForm({ title: "", amount: "", type: "expense", category: "Other", date: today(), taskId: "" });
      setModal(null);
      showNotice("Transaction added successfully.");
    });
  }

  function updateBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(budgetInput);
    if (!Number.isFinite(amount) || amount < 0) return;
    void save(async () => {
      const budget = await dashboardRequest<{ month: string; amount: number }>("/budget", {
        method: "PUT", body: { month: currentMonth, amount },
      });
      if (budget.month === today().slice(0, 7)) setMonthlyBudget(budget.amount);
      setModal(null);
      showNotice("Monthly budget updated.");
    });
  }

  function updateWidgets(changes: Partial<WidgetSettings>) {
    void save(async () => {
      const updated = await dashboardRequest<WidgetSettings>("/widgets", { method: "PATCH", body: changes });
      setWidgets(updated);
    });
  }

  const navigation = [
    { label: "Dashboard", href: "#overview", icon: LayoutDashboard },
    { label: "My Tasks", href: "#priorities", icon: ListTodo },
    { label: "Finances", href: "#finances", icon: Wallet },
    { label: "Deadlines", href: "#deadlines", icon: CalendarDays },
    { label: "Activity", href: "#activity", icon: Activity },
    { label: "Reports", href: "#weekly", icon: TrendingUp },
  ];

  if (isLoading || loadError || !user || loadedMonth !== currentMonth) {
    return (
      <div className="organix-dashboard">
        <main className="dash-main" aria-busy={isLoading || loadedMonth !== currentMonth}>
          <div className="dash-notice" role={loadError ? "alert" : "status"}>
            <span>{loadError || "Loading your workspace..."}</span>
            {loadError && (
              <button type="button" className="dash-button dash-button-outline" onClick={() => {
                setLoadError("");
                setIsLoading(true);
                setReloadKey((value) => value + 1);
              }}>Try again</button>
            )}
          </div>
        </main>
      </div>
    );
  }

  const initials = user.full_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const errorNotice = saveError ? (
    <div className="dash-notice" role="alert"><AlertCircle size={18} /><span>{saveError}</span></div>
  ) : null;

  return (
    <div className="organix-dashboard">
      {/* SIDEBAR */}
      <aside className={`dash-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="dash-sidebar-top">
          <Brand />
          <button
            className="dash-mobile-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dash-workspace-label">WORKSPACE</div>

        <nav className="dash-navigation" aria-label="Dashboard navigation">
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              className={`dash-nav-link ${index === 0 ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {label === "Deadlines" && overdueTasks.length > 0 && (
                <span className="dash-nav-count">{overdueTasks.length}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="dash-sidebar-bottom">
          <div className="dash-sidebar-help">
            <span className="dash-sidebar-help-icon">
              <ShieldCheck size={19} />
            </span>
            <strong>Your personal workspace</strong>
            <p>
              Keep your plans, deadlines and finances organized.
            </p>
          </div>

          <div className="dash-profile">
            <div className="dash-profile-avatar">{initials}</div>
            <div className="dash-profile-copy">
              <strong>{user.full_name}</strong>
              <small>{user.email}</small>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="dash-mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN */}
      <div className="dash-content-area">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="dash-icon-button dash-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <span className="dash-breadcrumb">Workspace</span>
            <span className="dash-breadcrumb-divider">/</span>
            <strong>Overview</strong>
          </div>

          <div className="dash-topbar-actions">
            <span className="dash-current-date">
              <CalendarDays size={16} />
              {formatDate(currentDate)}
            </span>

            <button
              type="button"
              className="dash-icon-button"
              onClick={() =>
                setTheme((value) => (value === "dark" ? "light" : "dark"))
              }
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              type="button"
              className="dash-icon-button dash-notification-button"
              onClick={() =>
                document.getElementById("deadlines")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              aria-label="View deadlines and alerts"
            >
              <Bell size={19} />
              {overdueTasks.length > 0 && <i />}
            </button>

            <div className="dash-topbar-avatar" title={user.full_name}>
              {initials}
            </div>
          </div>
        </header>

        <main className="dash-main" id="overview">
          {/* WELCOME */}
          <div className="dash-page-heading">
            <div>
              <span className="dash-page-eyebrow">{fullDate}</span>
              <h1>Good to see you, {user.full_name.split(/\s+/)[0]} <span>👋</span></h1>
              <p>
                Here's what's happening with your tasks and finances today.
              </p>
            </div>

            <div className="dash-heading-actions">
              <button
                type="button"
                className="dash-button dash-button-outline"
                onClick={() => setWidgetPanelOpen(true)}
              >
                <Settings2 size={17} />
                Customize
              </button>
              <button
                type="button"
                className="dash-button dash-button-primary"
                onClick={() => setModal("task")}
              >
                <Plus size={18} />
                New task
              </button>
            </div>
          </div>

          {!modal && !widgetPanelOpen && errorNotice}

          {notice && (
            <div className="dash-notice" role="status">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* OVERVIEW STATS */}
          {(widgets.tasks || widgets.finances) && (
            <div className="dash-stat-grid">
              {widgets.tasks && (
                <>
                  <div className="dash-stat-card">
                    <div className="dash-stat-top">
                      <span>Today's tasks</span>
                      <div className="dash-stat-icon violet">
                        <ListTodo size={20} />
                      </div>
                    </div>
                    <strong className="dash-stat-value">
                      {todayTasks.length}
                    </strong>
                    <div className="dash-stat-bottom">
                      <span className="dash-stat-sub">
                        {todayTasks.length - todayCompleted} remaining
                      </span>
                      <span className="dash-stat-link">
                        Due today
                      </span>
                    </div>
                  </div>

                  <div className="dash-stat-card">
                    <div className="dash-stat-top">
                      <span>Completed today</span>
                      <div className="dash-stat-icon green">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <strong className="dash-stat-value">
                      {todayCompleted}
                      <small> / {todayTasks.length}</small>
                    </strong>
                    <div className="dash-stat-progress">
                      <div>
                        <span style={{ width: `${completionRate}%` }} />
                      </div>
                      <small>{completionRate}% completed</small>
                    </div>
                  </div>
                </>
              )}

              {widgets.finances && (
                <>
                  <div className="dash-stat-card" id="finances">
                    <div className="dash-stat-top">
                      <span>Monthly income</span>
                      <div className="dash-stat-icon cyan">
                        <ArrowDownLeft size={20} />
                      </div>
                    </div>
                    <strong className="dash-stat-value money">
                      {formatMoney(income)}
                    </strong>
                    <div className="dash-stat-bottom">
                      <span className="dash-stat-sub">{monthLabel}</span>
                      <span className="dash-stat-positive">
                        <TrendingUp size={14} /> Income
                      </span>
                    </div>
                  </div>

                  <div className="dash-stat-card">
                    <div className="dash-stat-top">
                      <span>Monthly expenses</span>
                      <div className="dash-stat-icon orange">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                    <strong className="dash-stat-value money">
                      {formatMoney(expenses)}
                    </strong>
                    <div className="dash-stat-bottom">
                      <span className="dash-stat-sub">{monthLabel}</span>
                      <span className="dash-stat-expense">
                        <TrendingDown size={14} /> Spending
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* BUDGET AND BALANCE */}
          {widgets.finances && (
            <div className="dash-finance-grid">
              <Panel
                title="Monthly budget"
                subtitle={`Budget overview for ${monthLabel}`}
                action={
                  <button
                    type="button"
                    className="dash-text-button"
                    onClick={() => {
                      setBudgetInput(String(monthlyBudget));
                      setModal("budget");
                    }}
                  >
                    Edit budget <ArrowRight size={15} />
                  </button>
                }
              >
                <div className="dash-budget-top">
                  <div>
                    <small>Remaining budget</small>
                    <strong className={remainingBudget < 0 ? "negative" : ""}>
                      {formatMoney(remainingBudget)}
                    </strong>
                  </div>
                  <div className="dash-budget-usage">
                    {Math.round(budgetUsed)}% used
                  </div>
                </div>

                <div
                  className="dash-budget-track"
                  role="progressbar"
                  aria-label="Monthly budget used"
                  aria-valuenow={Math.round(budgetUsed)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className={expenses > monthlyBudget ? "over-budget" : ""}
                    style={{ width: `${budgetUsed}%` }}
                  />
                </div>

                <div className="dash-budget-labels">
                  <span>Spent: {formatMoney(expenses)}</span>
                  <span>Budget: {formatMoney(monthlyBudget)}</span>
                </div>

                {expenses > monthlyBudget && (
                  <p className="dash-budget-alert">
                    <AlertCircle size={15} />
                    You've exceeded your monthly budget by{" "}
                    {formatMoney(expenses - monthlyBudget)}.
                  </p>
                )}
              </Panel>

              <Panel
                title="Financial balance"
                subtitle="Income minus expenses this month"
                className="dash-balance-panel"
              >
                <div className="dash-balance-body">
                  <div>
                    <small>Current monthly net balance</small>
                    <strong className={balance < 0 ? "negative" : ""}>
                      {formatMoney(balance)}
                    </strong>
                    <p>
                      {balance >= 0
                        ? "Your recorded income is covering your expenses."
                        : "Your expenses currently exceed your recorded income."}
                    </p>
                  </div>
                  <span className="dash-balance-icon">
                    <Wallet size={28} />
                  </span>
                </div>
                <button
                  type="button"
                  className="dash-balance-add"
                  onClick={() => setModal("transaction")}
                >
                  <Plus size={16} /> Add transaction
                </button>
              </Panel>
            </div>
          )}

          {/* TASKS AND TRANSACTIONS */}
          {(widgets.priorities || widgets.transactions) && (
            <div className="dash-two-column">
              {widgets.priorities && (
                <Panel
                  id="priorities"
                  title="Today's priorities"
                  subtitle="Your next important tasks"
                  action={
                    <button
                      type="button"
                      className="dash-panel-plus"
                      onClick={() => setModal("task")}
                      aria-label="Add task"
                    >
                      <Plus size={18} />
                    </button>
                  }
                >
                  <div className="dash-task-list">
                    {topTasks.length ? (
                      topTasks.map((task) => (
                        <div className="dash-task-item" key={task.id}>
                          <button
                            type="button"
                            className="dash-task-checkbox"
                            disabled={isSaving}
                            onClick={() => toggleTask(task.id)}
                            aria-label={`Complete ${task.title}`}
                          >
                            <Check size={13} />
                          </button>

                          <div className="dash-task-info">
                            <strong>{task.title}</strong>
                            <div className="dash-task-details">
                              <span>{task.category}</span>
                              <span className="dash-detail-dot" />
                              <span>Today</span>
                            </div>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No pending tasks for today." />
                    )}
                  </div>
                  <div className="dash-panel-bottom">
                    <span>
                      {todayCompleted} of {todayTasks.length} tasks completed
                    </span>
                    <button
                      type="button"
                      className="dash-text-button"
                      onClick={() => setModal("task")}
                    >
                      Add task <ArrowRight size={15} />
                    </button>
                  </div>
                </Panel>
              )}

              {widgets.transactions && (
                <Panel
                  title="Latest transactions"
                  subtitle="Your three most recent entries"
                  action={
                    <button
                      type="button"
                      className="dash-panel-plus"
                      onClick={() => setModal("transaction")}
                      aria-label="Add transaction"
                    >
                      <Plus size={18} />
                    </button>
                  }
                >
                  <div className="dash-transaction-list">
                    {latestTransactions.length ? (
                      latestTransactions.map((transaction) => (
                        <div
                          className="dash-transaction-item"
                          key={transaction.id}
                        >
                          <div
                            className={`dash-transaction-icon ${
                              transaction.type === "income"
                                ? "income"
                                : "expense"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowDownLeft size={19} />
                            ) : (
                              <CreditCard size={19} />
                            )}
                          </div>
                          <div className="dash-transaction-info">
                            <strong>{transaction.title}</strong>
                            <span>
                              {transaction.category} ·{" "}
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                          <strong
                            className={`dash-transaction-amount ${
                              transaction.type
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatMoney(transaction.amount)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No transactions recorded." />
                    )}
                  </div>
                  <div className="dash-panel-bottom">
                    <span>
                      {monthlyTransactions.length} transactions this month
                    </span>
                    <button
                      type="button"
                      className="dash-text-button"
                      onClick={() => setModal("transaction")}
                    >
                      Add new <ArrowRight size={15} />
                    </button>
                  </div>
                </Panel>
              )}
            </div>
          )}

          {/* DEADLINES AND INSIGHTS */}
          {(widgets.deadlines || widgets.insights) && (
            <div className="dash-two-column">
              {widgets.deadlines && (
                <Panel
                  id="deadlines"
                  title="Deadlines & upcoming work"
                  subtitle="Stay on top of what needs attention"
                  action={
                    <span className="dash-small-count">
                      {overdueTasks.length} overdue
                    </span>
                  }
                >
                  {overdueTasks.length > 0 && (
                    <div className="dash-deadline-group">
                      <div className="dash-deadline-group-title overdue">
                        <AlertCircle size={16} /> Overdue
                      </div>
                      {overdueTasks.slice(0, 3).map((task) => (
                        <div className="dash-deadline-row" key={task.id}>
                          <span className="dash-deadline-indicator red" />
                          <div>
                            <strong>{task.title}</strong>
                            <small>Due {formatDate(task.dueDate)}</small>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="dash-deadline-group">
                    <div className="dash-deadline-group-title">
                      <Clock3 size={16} /> Coming up
                    </div>
                    {upcomingTasks.length ? (
                      upcomingTasks.map((task) => (
                        <div className="dash-deadline-row" key={task.id}>
                          <span className="dash-deadline-indicator violet" />
                          <div>
                            <strong>{task.title}</strong>
                            <small>Due {formatDate(task.dueDate)}</small>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No upcoming deadlines." />
                    )}
                  </div>
                </Panel>
              )}

              {widgets.insights && (
                <Panel
                  title="Insights & alerts"
                  subtitle="Useful information from your current data"
                  action={<Target size={19} className="dash-muted-icon" />}
                >
                  <div className="dash-insight-list">
                    {overdueTasks.length > 0 && (
                      <div className="dash-insight warning">
                        <div className="dash-insight-icon">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <strong>
                            {overdueTasks.length} overdue{" "}
                            {overdueTasks.length === 1 ? "task" : "tasks"}
                          </strong>
                          <p>
                            Review your overdue work and update your priorities.
                          </p>
                          <a href="#deadlines">Review deadlines</a>
                        </div>
                      </div>
                    )}

                    <div className="dash-insight">
                      <div className="dash-insight-icon purple">
                        <Target size={18} />
                      </div>
                      <div>
                        <strong>{completionRate}% daily completion</strong>
                        <p>
                          You've completed {todayCompleted} of{" "}
                          {todayTasks.length} tasks due today.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`dash-insight ${
                        remainingBudget < 0 ? "warning" : ""
                      }`}
                    >
                      <div className="dash-insight-icon green">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <strong>
                          {remainingBudget >= 0
                            ? `${formatMoney(remainingBudget)} budget remaining`
                            : "Monthly budget exceeded"}
                        </strong>
                        <p>
                          {remainingBudget >= 0
                            ? `${Math.round(budgetUsed)}% of your budget has been used.`
                            : `You've spent ${formatMoney(
                                -remainingBudget
                              )} over your budget.`}
                        </p>
                      </div>
                    </div>

                    {linkedTotal > 0 && (
                      <div className="dash-insight">
                        <div className="dash-insight-icon cyan">
                          <Activity size={18} />
                        </div>
                        <div>
                          <strong>Task-related expenses</strong>
                          <p>
                            {formatMoney(linkedTotal)} of this month's
                            spending is linked to tasks.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          )}

          {/* WEEKLY REPORT */}
          {widgets.weekly && (
            <Panel
              id="weekly"
              title="Weekly overview"
              subtitle="Task completion and financial activity over the last 7 days"
              action={
                <span className="dash-period-pill">
                  Last 7 days <ChevronDown size={14} />
                </span>
              }
              className="dash-weekly-panel"
            >
              <div className="dash-weekly-layout">
                <div className="dash-weekly-chart-area">
                  <div className="dash-weekly-chart-heading">
                    <div>
                      <small>Total weekly spending</small>
                      <strong>{formatMoney(weeklySpent)}</strong>
                    </div>
                    <span>
                      <i /> Daily expenses
                    </span>
                  </div>

                  <div
                    className="dash-weekly-chart"
                    aria-label="Daily expense bar chart"
                  >
                    {dailySpend.map((day) => (
                      <div className="dash-weekly-bar" key={day.date}>
                        <div className="dash-weekly-bar-track">
                          <div
                            style={{
                              height: `${
                                day.amount
                                  ? Math.max(
                                      (day.amount / maximumDailySpend) * 100,
                                      5
                                    )
                                  : 0
                              }%`,
                            }}
                            title={`${day.label}: ${formatMoney(day.amount)}`}
                          />
                        </div>
                        <span>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-weekly-results">
                  <div className="dash-weekly-result">
                    <span>Tasks completed</span>
                    <strong>
                      {weekCompleted}
                      <small> / {weekTasks.length}</small>
                    </strong>
                    <div className="dash-weekly-result-track">
                      <span style={{ width: `${weeklyCompletion}%` }} />
                    </div>
                  </div>

                  <div className="dash-weekly-result">
                    <span>Completion rate</span>
                    <strong>{weeklyCompletion}%</strong>
                    <small>Tasks due during the last 7 days</small>
                  </div>

                  <div className="dash-weekly-result">
                    <span>Weekly income</span>
                    <strong>{formatMoney(weeklyIncome)}</strong>
                    <small>Recorded in the last 7 days</small>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* LINKED EXPENSES AND ACTIVITY */}
          {(widgets.linked || widgets.activity) && (
            <div className="dash-two-column">
              {widgets.linked && (
                <Panel
                  title="Task-related spending"
                  subtitle={`Expenses linked to tasks in ${monthLabel}`}
                  action={<Wallet size={19} className="dash-muted-icon" />}
                >
                  <div className="dash-linked-summary">
                    <span>Total linked spending</span>
                    <strong>{formatMoney(linkedTotal)}</strong>
                    <small>
                      {linkedTransactions.length} linked transactions
                    </small>
                  </div>

                  <div className="dash-linked-list">
                    {linkedSummary.length ? (
                      linkedSummary.slice(0, 4).map((task) => (
                        <div className="dash-linked-row" key={task.id}>
                          <span className="dash-linked-icon">
                            <ListTodo size={16} />
                          </span>
                          <div>
                            <strong>{task.title}</strong>
                            <small>{task.category}</small>
                          </div>
                          <strong>{formatMoney(task.spending)}</strong>
                        </div>
                      ))
                    ) : (
                      <EmptyState text="No task-linked expenses this month." />
                    )}
                  </div>

                  <div className="dash-panel-bottom">
                    <span>Link expenses when creating transactions.</span>
                  </div>
                </Panel>
              )}

              {widgets.activity && (
                <Panel
                  id="activity"
                  title="Recent activity"
                  subtitle="The latest changes in your workspace"
                  action={<Activity size={19} className="dash-muted-icon" />}
                >
                  <div className="dash-activity-list">
                    {activities.map((activity) => (
                      <div className="dash-activity-item" key={activity.id}>
                        <span
                          className={`dash-activity-icon ${activity.type}`}
                        >
                          {activity.type === "income" ? (
                            <ArrowDownLeft size={16} />
                          ) : activity.type === "expense" ? (
                            <Wallet size={16} />
                          ) : (
                            <ListTodo size={16} />
                          )}
                        </span>

                        <div>
                          <strong>{activity.title}</strong>
                          <p>{activity.description}</p>
                        </div>
                        <small>
                          {new Date(activity.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </small>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          )}

          <footer className="dash-footer">
            <span>© {new Date().getFullYear()} Organix AI</span>
            <span>Your personal workspace</span>
          </footer>
        </main>
      </div>

      {/* WIDGET SETTINGS */}
      {widgetPanelOpen && (
        <div
          className="dash-modal-backdrop"
          onMouseDown={(event) => {
            if (!isSaving && event.target === event.currentTarget) {
              setWidgetPanelOpen(false);
            }
          }}
        >
          <div
            className="dash-modal dash-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-settings-title"
          >
            <div className="dash-modal-header">
              <div>
                <h2 id="dash-settings-title">Customize dashboard</h2>
                <p>Choose which sections appear in your workspace.</p>
              </div>
              <button
                disabled={isSaving}
                type="button"
                className="dash-icon-button"
                onClick={() => setWidgetPanelOpen(false)}
                aria-label="Close settings"
              >
                <X size={19} />
              </button>
            </div>

            {errorNotice}
            <div className="dash-widget-options" aria-busy={isSaving}>
              {widgetLabels.map(({ key, label }) => (
                <label className="dash-widget-option" key={key}>
                  <span>{label}</span>
                  <input
                    disabled={isSaving}
                    type="checkbox"
                    checked={widgets[key]}
                    onChange={(event) =>
                      updateWidgets({ [key]: event.target.checked })
                    }
                  />
                </label>
              ))}
            </div>

            <div className="dash-modal-actions">
              <button
                disabled={isSaving}
                type="button"
                className="dash-button dash-button-outline"
                onClick={() =>
                  updateWidgets(defaultWidgets)
                }
              >
                Reset defaults
              </button>
              <button
                disabled={isSaving}
                type="button"
                className="dash-button dash-button-primary"
                onClick={() => setWidgetPanelOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODALS */}
      {modal && (
        <div
          className="dash-modal-backdrop"
          onMouseDown={(event) => {
            if (!isSaving && event.target === event.currentTarget) setModal(null);
          }}
        >
          <div
            className="dash-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dash-modal-title"
          >
            <div className="dash-modal-header">
              <div>
                <h2 id="dash-modal-title">
                  {modal === "task"
                    ? "Create new task"
                    : modal === "transaction"
                      ? "Add transaction"
                      : "Edit monthly budget"}
                </h2>
                <p>
                  {modal === "task"
                    ? "Add a task to your daily workspace."
                    : modal === "transaction"
                      ? "Record an income or expense."
                      : "Set your monthly spending limit."}
                </p>
              </div>
              <button
                disabled={isSaving}
                type="button"
                className="dash-icon-button"
                onClick={() => setModal(null)}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            {errorNotice}

            {modal === "task" && (
              <form className="dash-modal-form" aria-busy={isSaving} onSubmit={createTask}>
                <label>
                  Task title
                  <input
                    disabled={isSaving}
                    autoFocus
                    required
                    maxLength={120}
                    placeholder="What needs to be done?"
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <div className="dash-form-row">
                  <label>
                    Category
                    <select
                      disabled={isSaving}
                      value={taskForm.category}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                    >
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Finance</option>
                      <option>Study</option>
                      <option>Health</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Priority
                    <select
                      disabled={isSaving}
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          priority: event.target.value as TaskPriority,
                        }))
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>
                </div>

                <label>
                  Due date
                  <input
                    disabled={isSaving}
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                  />
                </label>

                <div className="dash-modal-actions">
                  <button
                disabled={isSaving}
                    type="button"
                    className="dash-button dash-button-outline"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                disabled={isSaving}
                    type="submit"
                    className="dash-button dash-button-primary"
                  >
                    <Plus size={17} /> {isSaving ? "Saving..." : "Create task"}
                  </button>
                </div>
              </form>
            )}

            {modal === "transaction" && (
              <form className="dash-modal-form" aria-busy={isSaving} onSubmit={createTransaction}>
                <div className="dash-type-selector">
                  {(["expense", "income"] as const).map((type) => (
                    <button
                disabled={isSaving}
                      key={type}
                      type="button"
                      className={
                        transactionForm.type === type ? "selected" : ""
                      }
                      onClick={() =>
                        setTransactionForm((current) => ({
                          ...current,
                          type,
                          category: type === "income" ? "Salary" : "Other",
                          taskId: "",
                        }))
                      }
                    >
                      {type === "expense" ? "Expense" : "Income"}
                    </button>
                  ))}
                </div>

                <label>
                  Description
                  <input
                    disabled={isSaving}
                    autoFocus
                    required
                    maxLength={120}
                    placeholder="e.g. Grocery shopping"
                    value={transactionForm.title}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <div className="dash-form-row">
                  <label>
                    Amount (USD)
                    <input
                    disabled={isSaving}
                      type="number"
                      required
                      min="0.01"
                      max="999999999"
                      step="0.01"
                      placeholder="0.00"
                      value={transactionForm.amount}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          amount: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Category
                    <select
                      disabled={isSaving}
                      value={transactionForm.category}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                    >
                      {(transactionForm.type === "expense"
                        ? [
                            "Other",
                            "Food",
                            "Transport",
                            "Bills",
                            "Work",
                            "Software",
                            "Shopping",
                            "Health",
                            "Education",
                          ]
                        : ["Salary", "Freelance", "Business", "Gift", "Other"]
                      ).map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Transaction date
                  <input
                    disabled={isSaving}
                    type="date"
                    required
                    value={transactionForm.date}
                    onChange={(event) =>
                      setTransactionForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />
                </label>

                {transactionForm.type === "expense" && (
                  <label>
                    Related task (optional)
                    <select
                      disabled={isSaving}
                      value={transactionForm.taskId}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          taskId: event.target.value,
                        }))
                      }
                    >
                      <option value="">No linked task</option>
                      {tasks.map((task) => (
                        <option value={task.id} key={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="dash-modal-actions">
                  <button
                disabled={isSaving}
                    type="button"
                    className="dash-button dash-button-outline"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                disabled={isSaving}
                    type="submit"
                    className="dash-button dash-button-primary"
                  >
                    <Plus size={17} /> {isSaving ? "Saving..." : "Save transaction"}
                  </button>
                </div>
              </form>
            )}

            {modal === "budget" && (
              <form className="dash-modal-form" aria-busy={isSaving} onSubmit={updateBudget}>
                <label>
                  Monthly budget (USD)
                  <input
                    disabled={isSaving}
                    autoFocus
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    max="999999999"
                    value={budgetInput}
                    onChange={(event) => setBudgetInput(event.target.value)}
                  />
                </label>

                <p className="dash-modal-hint">
                  Your remaining budget is calculated by subtracting
                  the current month's expenses from this amount.
                </p>

                <div className="dash-modal-actions">
                  <button
                disabled={isSaving}
                    type="button"
                    className="dash-button dash-button-outline"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                disabled={isSaving}
                    type="submit"
                    className="dash-button dash-button-primary"
                  >
                    {isSaving ? "Saving..." : "Save budget"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
