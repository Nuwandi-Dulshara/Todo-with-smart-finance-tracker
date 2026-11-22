
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Layers3,
  LayoutDashboard,
  ListTodo,
  LockKeyhole,
  Menu,
  Moon,
  Play,
  Plus,
  Send,
  Sun,
  Timer,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import "./App.css";

// ============================================================
// TYPES
// ============================================================

type Theme = "dark" | "light";

type ShowcaseTab =
  | "Overview"
  | "Tasks"
  | "Kanban"
  | "Expenses"
  | "Time Tracking";

type DemoTask = {
  title: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  subtasks: string[];
};

type PreviewTask = {
  title: string;
  category: string;
  color: string;
  priority: string;
  completed: boolean;
};

type KanbanColumn = "To Do" | "In Progress" | "Done";

type KanbanState = Record<KanbanColumn, string[]>;

// ============================================================
// DATA
// ============================================================

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "AI Assistant", href: "#ai" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const features = [
  {
    title: "Smart Task Management",
    description:
      "Create, prioritize, organize and complete your work with a clearer view of every responsibility.",
    className: "feature-large",
    visual: "tasks",
  },
  {
    title: "Your AI Copilot",
    description:
      "Turn complex goals into actionable tasks and receive intelligent productivity suggestions.",
    className: "feature-large",
    visual: "ai",
  },
  {
    title: "Visual Kanban Boards",
    description:
      "Move work through customizable stages and visualize your progress.",
    className: "",
    visual: "kanban",
  },
  {
    title: "Recurring Tasks",
    description:
      "Automate your daily, weekly and monthly routines.",
    className: "",
    visual: "repeat",
  },
  {
    title: "Time Tracking",
    description:
      "Understand where your hours go and improve your focus.",
    className: "",
    visual: "time",
  },
  {
    title: "Expense Intelligence",
    description:
      "Connect tasks, expenses, budgets and financial goals.",
    className: "",
    visual: "expense",
  },
];

const previewTasks: PreviewTask[] = [
  {
    title: "Finalize website design",
    category: "Design",
    color: "violet",
    priority: "High",
    completed: true,
  },
  {
    title: "Review monthly expenses",
    category: "Finance",
    color: "cyan",
    priority: "Medium",
    completed: false,
  },
  {
    title: "Prepare product presentation",
    category: "Work",
    color: "orange",
    priority: "High",
    completed: false,
  },
  {
    title: "Plan next week's priorities",
    category: "Personal",
    color: "green",
    priority: "Low",
    completed: false,
  },
];

const initialKanban: KanbanState = {
  "To Do": [
    "Prepare launch assets",
    "Review monthly budget",
  ],
  "In Progress": [
    "Build AI assistant",
    "Design dashboard",
  ],
  Done: [
    "Create project structure",
    "Configure database",
  ],
};

const faqs = [
  {
    question: "What is Organix AI?",
    answer:
      "Organix AI is a productivity and life-management platform concept that brings tasks, project planning, time tracking, expenses and AI-assisted organization into one workspace.",
  },
  {
    question:
      "Can I manage both personal tasks and work projects?",
    answer:
      "Yes. The planned application supports separate categories, projects, task boards and productivity views so you can keep personal and professional work organized.",
  },
  {
    question: "How does the AI assistant work?",
    answer:
      "The planned assistant will help create tasks from natural language, break goals into steps, suggest priorities and summarize productivity data. The public-page demonstration currently uses sample data.",
  },
  {
    question:
      "Does the website save tasks from the live demo?",
    answer:
      "No. The homepage demonstration is entirely local to your browser session. It does not create an account or save tasks to a database.",
  },
  {
    question:
      "Can I access Organix AI on mobile devices?",
    answer:
      "The frontend is designed to be responsive across desktops, tablets and phones. Backend authentication and account synchronization will be integrated separately.",
  },
];

// ============================================================
// LOGO
// ============================================================

function Logo() {
  return (
    <a
      href="#home"
      className="brand"
      aria-label="Organix AI home"
    >
      <span className="brand-symbol">
        <span />
        <span />
        <span />
        <span />
      </span>

      <span>
        Organix
        <span className="brand-ai">AI</span>
      </span>
    </a>
  );
}

// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={`section-heading ${
        centered ? "centered" : ""
      }`}
    >
      {eyebrow && (
        <span className="eyebrow">
          {eyebrow}
        </span>
      )}

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
    <header
      className={`site-header ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="container nav-inner">
        <Logo />

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-button theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${
              theme === "dark"
                ? "light"
                : "dark"
            } mode`}
          >
            {theme === "dark" ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          <a
            href="/login"
            className="login-link"
          >
            Log In
          </a>

          <a
            href="/register"
            className="btn btn-primary nav-signup"
          >
            Get Started
            <ArrowUpRight size={16} />
          </a>

          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() =>
                setMenuOpen(false)
              }
            >
              {item.label}
            </a>
          ))}

          <a
            href="/login"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Log In
          </a>

          <a
            href="/register"
            className="btn btn-primary"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Create Free Account
            <ArrowRight size={16} />
          </a>
        </nav>
      )}
    </header>
  );
}

// ============================================================
// CHART
// ============================================================

function MiniAreaChart() {
  return (
    <svg
      className="area-chart"
      viewBox="0 0 450 150"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative upward-trending productivity chart"
    >
      <defs>
        <linearGradient
          id="chartFill"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#7957ff"
            stopOpacity=".32"
          />

          <stop
            offset="100%"
            stopColor="#7957ff"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      {[30, 70, 110].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="450"
          y2={y}
          stroke="currentColor"
          strokeOpacity=".12"
          strokeDasharray="4 6"
        />
      ))}

      <path
        d="M0 118 C30 115 43 75 70 90 S115 122 145 86 S195 70 222 91 S267 38 302 58 S345 83 380 35 S415 45 450 16 L450 150 L0 150 Z"
        fill="url(#chartFill)"
      />

      <path
        d="M0 118 C30 115 43 75 70 90 S115 122 145 86 S195 70 222 91 S267 38 302 58 S345 83 380 35 S415 45 450 16"
        fill="none"
        stroke="#9277ff"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="450"
        cy="16"
        r="5"
        fill="#22d3ee"
      />
    </svg>
  );
}

// ============================================================
// DASHBOARD PREVIEW
// UPDATED: initialTab prop added
// ============================================================

function DashboardPreview({
  compact = false,
  initialTab = "Overview",
}: {
  compact?: boolean;
  initialTab?: ShowcaseTab;
}) {
  const [activeTab, setActiveTab] =
    useState<ShowcaseTab>(initialTab);

  const [tasks, setTasks] =
    useState<PreviewTask[]>(previewTasks);

  const [kanban, setKanban] =
    useState<KanbanState>(initialKanban);

  const [running, setRunning] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  // ----------------------------------------------------------
  // TIMER
  // ----------------------------------------------------------

  useEffect(() => {
    if (!running) return;

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [running]);

  // ----------------------------------------------------------
  // TASK STATISTICS
  // ----------------------------------------------------------

  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const completion =
    tasks.length > 0
      ? Math.round(
          (completed / tasks.length) * 100
        )
      : 0;

  const timerText = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ]
    .map((value) =>
      String(value).padStart(2, "0")
    )
    .join(":");

  // ----------------------------------------------------------
  // ADD TASK
  // ----------------------------------------------------------

  function addPreviewTask() {
    setTasks((current) => [
      ...current,
      {
        title: `New task ${current.length + 1}`,
        category: "Personal",
        color: "violet",
        priority: "Medium",
        completed: false,
      },
    ]);

    setActiveTab("Tasks");
  }

  // ----------------------------------------------------------
  // TOGGLE TASK COMPLETION
  // ----------------------------------------------------------

  function toggleTask(index: number) {
    setTasks((current) =>
      current.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  }

  // ----------------------------------------------------------
  // MOVE KANBAN TASK
  // ----------------------------------------------------------

  function moveKanbanTask(
    column: KanbanColumn,
    title: string
  ) {
    const order: KanbanColumn[] = [
      "To Do",
      "In Progress",
      "Done",
    ];

    const index = order.indexOf(column);

    if (index === order.length - 1) {
      return;
    }

    const nextColumn = order[index + 1];

    setKanban((current) => ({
      ...current,

      [column]: current[column].filter(
        (task) => task !== title
      ),

      [nextColumn]: [
        ...current[nextColumn],
        title,
      ],
    }));
  }

  // ----------------------------------------------------------
  // SIDEBAR
  // ----------------------------------------------------------

  const sidebarItems: {
    icon: typeof LayoutDashboard;
    label: ShowcaseTab;
  }[] = [
    {
      icon: LayoutDashboard,
      label: "Overview",
    },
    {
      icon: ListTodo,
      label: "Tasks",
    },
    {
      icon: Layers3,
      label: "Kanban",
    },
    {
      icon: Wallet,
      label: "Expenses",
    },
    {
      icon: Timer,
      label: "Time Tracking",
    },
  ];

  return (
    <div
      className={`dashboard-window ${
        compact ? "compact" : ""
      }`}
    >
      {/* WINDOW TOP BAR */}

      <div className="window-topbar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>

        <div className="window-address">
          <LockKeyhole size={11} />
          app.organix.ai / dashboard
        </div>

        <div className="window-topbar-spacer" />
      </div>

      <div className="dashboard-layout">
        {/* SIDEBAR */}

        <aside className="dashboard-sidebar">
          <div className="dashboard-mini-logo">
            <span className="mini-logo-icon">
              <Zap
                size={14}
                fill="currentColor"
              />
            </span>

            <strong>organix</strong>
          </div>

          <div className="sidebar-caption">
            WORKSPACE
          </div>

          {sidebarItems.map(
            ({ icon: Icon, label }) => (
              <button
                type="button"
                key={label}
                className={`sidebar-link ${
                  activeTab === label
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(label)
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            )
          )}

          <div className="sidebar-bottom">
            <div className="sidebar-avatar">
              JD
            </div>

            <div>
              <strong>Jamie Doe</strong>
              <small>Sample workspace</small>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <div className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="dashboard-overline">
                YOUR WORKSPACE
              </span>

              <h3>
                {activeTab === "Overview"
                  ? "Good morning, Jamie"
                  : activeTab}
              </h3>

              <p>
                {activeTab === "Overview"
                  ? "Here's what's happening with your productivity."
                  : "Explore this interactive sample workspace."}
              </p>
            </div>

            <button
              type="button"
              className="dashboard-add-btn"
              onClick={addPreviewTask}
              title="Add sample task"
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
          </div>

          {/* =========================================
              OVERVIEW TAB
          ========================================= */}

          {activeTab === "Overview" && (
            <>
              <div className="dashboard-stats">
                <div className="dash-stat">
                  <span>
                    <ListTodo size={15} />
                    Total tasks
                  </span>

                  <strong>
                    {tasks.length}
                  </strong>

                  <small>
                    In your workspace
                  </small>
                </div>

                <div className="dash-stat">
                  <span>
                    <CheckCircle2 size={15} />
                    Completed
                  </span>

                  <strong>
                    {completed}
                  </strong>

                  <small>
                    {completion}% of all tasks
                  </small>
                </div>

                <div className="dash-stat">
                  <span>
                    <Timer size={15} />
                    Focus time
                  </span>

                  <strong>24.5h</strong>

                  <small>
                    Sample this week
                  </small>
                </div>
              </div>

              <div className="dashboard-chart-card">
                <div className="dash-card-heading">
                  <div>
                    <strong>
                      Productivity overview
                    </strong>

                    <small>
                      Illustrative weekly performance
                    </small>
                  </div>

                  <span className="positive-pill">
                    <TrendingUp size={12} />
                    Trending up
                  </span>
                </div>

                <MiniAreaChart />

                <div className="chart-labels">
                  {[
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                  ].map((day) => (
                    <span key={day}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dashboard-bottom-row">
                <div className="dashboard-small-card">
                  <strong>
                    Recent tasks
                  </strong>

                  {tasks
                    .slice(0, 3)
                    .map((task, index) => (
                      <div
                        className="mini-task"
                        key={index}
                      >
                        <span
                          className={`mini-checkbox ${
                            task.completed
                              ? "done"
                              : ""
                          }`}
                        >
                          {task.completed && (
                            <Check size={10} />
                          )}
                        </span>

                        <span>
                          {task.title}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="dashboard-small-card progress-card">
                  <strong>
                    Task progress
                  </strong>

                  <div
                    className="progress-ring"
                    style={{
                      background: `conic-gradient(
                        #7957ff ${completion}%,
                        var(--ring-track) ${completion}%
                      )`,
                    }}
                  >
                    <div>
                      {completion}%
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================
              TASKS TAB
          ========================================= */}

          {activeTab === "Tasks" && (
            <div className="dashboard-content-card">
              <div className="dash-card-heading">
                <strong>All Tasks</strong>

                <span className="small-muted">
                  {tasks.length} tasks
                </span>
              </div>

              {tasks.map(
                (task, index) => (
                  <div
                    className="task-table-row"
                    key={index}
                  >
                    <button
                      type="button"
                      className={`task-check ${
                        task.completed
                          ? "checked"
                          : ""
                      }`}
                      aria-label={`Toggle ${task.title}`}
                      onClick={() =>
                        toggleTask(index)
                      }
                    >
                      {task.completed && (
                        <Check size={12} />
                      )}
                    </button>

                    <span
                      className={
                        task.completed
                          ? "task-done"
                          : ""
                      }
                    >
                      {task.title}
                    </span>

                    <span
                      className={`task-category ${task.color}`}
                    >
                      {task.category}
                    </span>

                    <span className="task-priority">
                      {task.priority}
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          {/* =========================================
              KANBAN TAB
          ========================================= */}

          {activeTab === "Kanban" && (
            <div className="kanban-columns">
              {(
                Object.keys(
                  kanban
                ) as KanbanColumn[]
              ).map((column) => (
                <div
                  className="kanban-column"
                  key={column}
                >
                  <div className="kanban-column-title">
                    <span>
                      {column}
                    </span>

                    <span>
                      {kanban[column].length}
                    </span>
                  </div>

                  {kanban[column].map(
                    (task) => (
                      <button
                        type="button"
                        key={task}
                        className="kanban-card"
                        onClick={() =>
                          moveKanbanTask(
                            column,
                            task
                          )
                        }
                        title={
                          column === "Done"
                            ? "Completed"
                            : "Click to advance to the next stage"
                        }
                      >
                        <GripVertical size={13} />

                        <span>
                          {task}
                        </span>

                        {column !== "Done" && (
                          <ChevronRight size={13} />
                        )}
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* =========================================
              EXPENSES TAB
          ========================================= */}

          {activeTab === "Expenses" && (
            <div className="dashboard-content-card">
              <div className="dash-card-heading">
                <strong>
                  Expense overview
                </strong>

                <span className="small-muted">
                  Sample data
                </span>
              </div>

              <div className="expense-total">
                $1,840.00
              </div>

              <p className="small-muted">
                Total tracked expenses this month
              </p>

              {[
                {
                  name: "Projects",
                  percentage: 65,
                  amount: "$1,196",
                },
                {
                  name: "Subscriptions",
                  percentage: 23,
                  amount: "$423",
                },
                {
                  name: "Other",
                  percentage: 12,
                  amount: "$221",
                },
              ].map(
                ({
                  name,
                  percentage,
                  amount,
                }) => (
                  <div
                    className="expense-row"
                    key={name}
                  >
                    <div className="expense-row-label">
                      <span>
                        {name}
                      </span>

                      <strong>
                        {amount}
                      </strong>
                    </div>

                    <div className="expense-bar">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* =========================================
              TIME TRACKING TAB
          ========================================= */}

          {activeTab ===
            "Time Tracking" && (
            <div className="dashboard-content-card timer-demo">
              <div className="dash-card-heading">
                <strong>
                  Focus timer
                </strong>

                <span className="small-muted">
                  Live local timer
                </span>
              </div>

              <div className="timer-value">
                {timerText}
              </div>

              <p>
                Track your focus session
              </p>

              <div className="timer-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setRunning(
                      (current) => !current
                    )
                  }
                >
                  {running
                    ? "Pause"
                    : "Start Focus"}

                  <Play size={14} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRunning(false);
                    setSeconds(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HERO SECTION
// ============================================================

function Hero() {
  return (
    <section
      className="hero"
      id="home"
    >
      <div className="container hero-content">
        <div className="hero-copy">
          <h1>
            Your Life. Your Tasks.

            <span className="gradient-text">
              {" "}
              One Intelligent Workspace.
            </span>
          </h1>

          <p className="hero-description">
            Stop juggling apps. Organize your
            tasks, master your time, track
            expenses and achieve more with an
            AI-powered workspace designed
            around your life.
          </p>

          <div className="hero-buttons">
            <a
              href="/register"
              className="btn btn-primary btn-large"
            >
              Get Started Free
            </a>

            <a
              href="#showcase"
              className="btn btn-secondary btn-large"
            >
              Explore the Platform
            </a>
          </div>
        </div>

        <div className="hero-dashboard-wrap">
          <DashboardPreview compact />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FEATURE VISUALS
// ============================================================

function FeatureVisual({
  kind,
}: {
  kind: string;
}) {
  if (kind === "tasks") {
    const items: {
      name: string;
      done: boolean;
    }[] = [
      {
        name: "Plan the week",
        done: true,
      },
      {
        name: "Complete project proposal",
        done: true,
      },
      {
        name: "Review financial goals",
        done: false,
      },
    ];

    return (
      <div className="feature-task-visual">
        {items.map(({ name, done }) => (
          <div
            className="feature-visual-task"
            key={name}
          >
            <span
              className={`visual-check ${
                done ? "is-done" : ""
              }`}
            >
              {done && (
                <Check size={11} />
              )}
            </span>

            <span>
              {name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "ai") {
    return (
      <div className="feature-ai-visual">
        <strong>Product launch</strong>
        <div>
          <span>Outline the launch plan</span>
          <span>Prepare the first announcement</span>
        </div>
      </div>
    );
  }

  if (kind === "kanban") {
    return (
      <div className="feature-kanban-visual">
        {[2, 3, 1].map(
          (count, index) => (
            <div
              className="feature-kanban-col"
              key={index}
            >
              <span />

              {Array.from({
                length: count,
              }).map((_, itemIndex) => (
                <i key={itemIndex} />
              ))}
            </div>
          )
        )}
      </div>
    );
  }

  if (kind === "repeat") {
    return (
      <div className="feature-repeat-visual">
        <div>
          <strong>Weekly review</strong>
          <span>Every Friday · 3:00 PM</span>
        </div>
        <div>
          <strong>Monthly budget</strong>
          <span>First day of each month</span>
        </div>
      </div>
    );
  }

  if (kind === "time") {
    return (
      <div className="feature-centered-visual">
        <div className="feature-timer">
          02:45:18
        </div>

        <span>
          Focus session
        </span>
        <div className="feature-timer-track">
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="feature-expense-visual">
      <span>
        Monthly spending
      </span>

      <strong>
        $1,840.00
      </strong>

      <div className="feature-expense-bars">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

// ============================================================
// FEATURES SECTION
// ============================================================

function Features() {
  return (
    <section
      className="section features-section"
      id="features"
    >
      <div className="container">
        <SectionHeading
          title="Everything you need to work smarter."
          description="Powerful tools that work together, so you can focus on what matters instead of managing scattered apps."
        />

        <div className="features-grid">
          {features.map(
            ({
              title,
              description,
              className,
              visual,
            }) => (
              <article
                className={`feature-card ${className}`}
                key={title}
              >
                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>

                <FeatureVisual
                  kind={visual}
                />
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SAMPLE AI TASK GENERATOR
// ============================================================

function generateSampleTask(
  input: string
): DemoTask {
  const text = input.toLowerCase();

  const isBudget =
    /budget|expense|money|finance|saving/.test(
      text
    );

  const isStudy =
    /study|exam|learn|course|revision/.test(
      text
    );

  const isProject =
    /project|website|app|launch|build/.test(
      text
    );

  const isUrgent =
    /urgent|asap|tomorrow|important|deadline/.test(
      text
    );

  let subtasks = [
    "Define the expected outcome",
    "Break the work into manageable steps",
    "Schedule time to complete the task",
    "Review the results",
  ];

  if (isBudget) {
    subtasks = [
      "Review current transactions",
      "Group expenses by category",
      "Set a spending limit",
      "Review savings opportunities",
    ];
  } else if (isStudy) {
    subtasks = [
      "Identify the topics to cover",
      "Create a revision schedule",
      "Practice with sample questions",
      "Review difficult areas",
    ];
  } else if (isProject) {
    subtasks = [
      "Define project requirements",
      "Create development milestones",
      "Implement the first deliverable",
      "Test and review the result",
    ];
  }

  return {
    title: input.trim(),

    priority: isUrgent
      ? "High"
      : "Medium",

    due: /tomorrow/.test(text)
      ? "Tomorrow (suggested)"
      : "Not set",

    subtasks,
  };
}

// ============================================================
// AI ASSISTANT
// ============================================================

function AIAssistant() {
  const [prompt, setPrompt] =
    useState("");

  const [result, setResult] =
    useState<DemoTask | null>(null);

  const suggestions = [
    "Plan my weekly study schedule",
    "Build my portfolio website",
    "Review my monthly budget",
  ];

  function submitPrompt(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    setResult(
      generateSampleTask(prompt)
    );
  }

  function chooseSuggestion(
    value: string
  ) {
    setPrompt(value);

    setResult(
      generateSampleTask(value)
    );
  }

  return (
    <section
      className="section ai-section"
      id="ai"
    >
      <div className="container ai-layout">
        <div className="ai-intro">
          <h2>
            Big goals become{" "}
            <span className="gradient-text">
              simple next steps.
            </span>
          </h2>

          <p>
            Imagine having a productivity partner
            that helps organize your thoughts,
            turn ideas into tasks and build
            practical plans.
          </p>

          <div className="ai-benefits">
            {[
              [
                "Natural-language planning",
                "Describe what you need in everyday language.",
              ],
              [
                "Intelligent task breakdown",
                "Transform big goals into smaller actions.",
              ],
              [
                "Actionable suggestions",
                "Get a clearer starting point for your work.",
              ],
            ].map(
              ([
                title,
                description,
              ]) => (
                <div
                  className="ai-benefit"
                  key={title}
                >
                  <div>
                    <strong>
                      {title}
                    </strong>

                    <p>
                      {description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <a
            href="/register"
            className="btn btn-primary"
          >
            Start Organizing Smarter

            <ArrowRight size={17} />
          </a>
        </div>

        <div className="ai-chat-panel">
          <div className="ai-panel-header">
            <div>
              <strong>
                Task planning
              </strong>

              <span>
                Interactive example
              </span>
            </div>
          </div>

          <div className="ai-chat-body">
            <div className="chat-message assistant">
              <div className="chat-bubble">
                Tell me what
                you're planning and I'll
                show you how it could
                become an organized task.
              </div>
            </div>

            {result ? (
              <>
                <div className="chat-message user">
                  <div className="chat-bubble">
                    {result.title}
                  </div>
                </div>

                <div className="chat-message assistant">
                  <div className="chat-bubble">
                    Here's a suggested plan
                    you can use as a starting
                    point.

                    <div className="generated-task">
                      <div className="generated-task-header">
                        <strong>
                          {result.title}
                        </strong>

                        <span className="priority-badge">
                          {result.priority}
                        </span>
                      </div>

                      <div className="generated-task-due">
                        {result.due}
                      </div>

                      <ol className="generated-subtasks">
                        {result.subtasks.map(
                          (subtask) => (
                            <li
                              className="generated-subtask"
                              key={subtask}
                            >
                              {subtask}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-suggestions">
                {suggestions.map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() =>
                        chooseSuggestion(
                          suggestion
                        )
                      }
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <form
            className="ai-chat-input"
            onSubmit={submitPrompt}
          >
            <input
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value
                )
              }
              placeholder="e.g. Build my portfolio website"
              aria-label="Task description for AI demo"
              maxLength={180}
            />

            <button
              type="submit"
              aria-label="Generate sample task"
            >
              <Send size={17} />
            </button>
          </form>

          <div className="ai-panel-footnote">
            This example uses local rules and does not call a live AI service.
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRODUCT SHOWCASE
// UPDATED: Tabs now open matching dashboard views
// ============================================================

function Showcase() {
  const [active, setActive] =
    useState(0);

  const tabs = [
    { label: "Task management" },
    { label: "Kanban board" },
    { label: "Expenses" },
    { label: "Time tracking" },
    { label: "Insights" },
  ];

  // UPDATED: Maps showcase tabs to dashboard tabs

  const previewViews: ShowcaseTab[] = [
    "Tasks",
    "Kanban",
    "Expenses",
    "Time Tracking",
    "Overview",
  ];

  const descriptions = [
    "Organize responsibilities, track progress and complete work with confidence.",

    "See your entire workflow and move tasks between stages with one click.",

    "Visualize spending and connect financial decisions with your goals.",

    "Start focused work sessions and understand how you spend your time.",

    "Turn task activity into a clearer picture of your productivity.",
  ];

  return (
    <section
      className="section showcase-section"
      id="showcase"
    >
      <div className="container">
        <SectionHeading
          eyebrow="PRODUCT PREVIEW"
          title="A clear view of work in progress."
          description="Switch between tasks, boards, expenses and time to see how the workspace brings everyday work together."
        />

        {/* SHOWCASE TABS */}

        <div
          className="showcase-tabs"
          role="tablist"
          aria-label="Product features"
        >
          {tabs.map(({ label }, index) => (
              <button
                type="button"
                key={label}
                role="tab"
                aria-selected={
                  active === index
                }
                className={
                  active === index
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActive(index)
                }
              >
                {label}
              </button>
          ))}
        </div>

        {/* UPDATED: SELECTED DASHBOARD VIEW */}

        <div className="showcase-window-wrap">
          <DashboardPreview
            key={active}
            initialTab={
              previewViews[active]
            }
          />
        </div>

        {/* DESCRIPTION */}

        <div className="showcase-description">
          <p>
            {descriptions[active]}
          </p>

          <a href="/register">
            Explore Organix AI

            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// ANALYTICS SECTION
// ============================================================

function Analytics() {
  const weeklyValues = [
    45,
    68,
    53,
    84,
    61,
    94,
    76,
  ];

  const days = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
  ];

  return (
    <section
      className="section analytics-section"
      id="insights"
    >
      <div className="container analytics-layout">
        <div className="analytics-visual">
          <div className="analytics-main-card">
            <div className="analytics-card-title">
              <h3>Weekly activity</h3>
            </div>

            <div className="analytics-numbers">
              <div>
                <span>
                  Completion rate
                </span>

                <strong>
                  84%
                </strong>

                <small>
                  Sample data
                </small>
              </div>

              <div>
                <span>
                  Focus hours
                </span>

                <strong>
                  32.5h
                </strong>

                <small>
                  Sample week
                </small>
              </div>
            </div>

            <div className="analytics-bars">
              {weeklyValues.map(
                (height, index) => (
                  <div
                    className="analytics-bar-item"
                    key={index}
                  >
                    <div className="analytics-bar-track">
                      <span
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <small>
                      {days[index]}
                    </small>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="analytics-copy">
          <h2>
            Don't just stay busy.

            <span className="gradient-text">
              {" "}
              Make real progress.
            </span>
          </h2>

          <p>
            Understand how your time, effort
            and spending connect. Gain the
            clarity you need to make better
            decisions and build productive
            routines.
          </p>

          <div className="insight-list">
            {[
              [
                "Track meaningful progress",
                "See your task completion and milestones.",
              ],
              [
                "Understand your time",
                "Discover patterns in your focus sessions.",
              ],
              [
                "Connect work and expenses",
                "Explore productivity and spending together.",
              ],
            ].map(
              ([
                title,
                description,
              ]) => (
                <div
                  className="insight-item"
                  key={title}
                >
                  <div>
                    <strong>
                      {title}
                    </strong>

                    <span>
                      {description}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title:
        "Create your workspace",
      description:
        "Register, set up your profile and create a home for your goals and projects.",
    },
    {
      number: "02",
      title:
        "Organize everything",
      description:
        "Add tasks, build workflows, track time and manage your finances.",
    },
    {
      number: "03",
      title:
        "Grow with intelligence",
      description:
        "Use AI-assisted planning and insightful reports to work toward your goals.",
    },
  ];

  return (
    <section
      className="section how-section"
      id="how-it-works"
    >
      <div className="container">
        <SectionHeading
          title="A straightforward way to get started."
          description="Set up your space, bring your work together and build a rhythm that lasts."
        />

        <div className="steps-grid">
          {steps.map(
            ({
              number,
              title,
              description,
            }) => (
              <div
                className="step-card"
                key={number}
              >
                <span className="step-number">
                  {number}
                </span>

                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRICING
// ============================================================

function Pricing() {
  const [annual, setAnnual] =
    useState(false);

  const plans = [
    {
      name: "Free",
      description:
        "A simple way to start organizing your day.",
      price: "$0",
      subtitle: "Concept tier",
      features: [
        "Personal task management",
        "Basic project boards",
        "Task categories",
        "Basic productivity overview",
      ],
    },
    {
      name: "Pro",
      description:
        "More intelligence for ambitious individuals.",
      price: "TBA",
      subtitle:
        "Price not announced",
      features: [
        "Everything in Free",
        "AI-assisted task planning",
        "Advanced productivity insights",
        "Expense and budget tools",
        "Advanced recurring workflows",
      ],
    },
    {
      name: "Team",
      description:
        "A connected workspace for shared goals.",
      price: "TBA",
      subtitle:
        "Price not announced",
      features: [
        "Everything in Pro",
        "Shared project spaces",
        "Team task assignments",
        "Collaboration tools",
        "Team productivity reports",
      ],
    },
  ];

  return (
    <section
      className="section pricing-section"
      id="pricing"
    >
      <div className="container">
        <SectionHeading
          title="Plans for different ways of working."
          description="We’re shaping the plan structure now. Pricing and availability have not been announced."
        />

        <div className="pricing-toggle-wrap">
          <span className={`pricing-period ${annual ? "" : "active"}`}>
            Monthly
          </span>

          <button
            type="button"
            className={`pricing-toggle ${
              annual ? "on" : ""
            }`}
            onClick={() =>
              setAnnual(
                (current) => !current
              )
            }
            aria-label="Toggle annual billing"
            aria-pressed={annual}
          >
            <span />
          </button>

          <span className={`pricing-period ${annual ? "active" : ""}`}>
            Yearly
          </span>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              className="pricing-card"
              key={plan.name}
            >
              <h3>
                {plan.name}
              </h3>

              <p>
                {plan.description}
              </p>

              <div className="plan-price">
                {plan.price}
              </div>

              <span className="plan-subtitle">
                {plan.subtitle}
              </span>

              <a
                href={
                  plan.name === "Free"
                    ? "/register"
                    : "#faq"
                }
                className={`btn ${
                  plan.name === "Free"
                    ? "btn-primary"
                    : "btn-secondary"
                } pricing-btn`}
              >
                {plan.name === "Free"
                  ? "Get Started"
                  : "Explore Planned Features"}
              </a>

              <div className="plan-divider" />

              <strong className="plan-include-title">
                Planned features
              </strong>

              <ul>
                {plan.features.map(
                  (feature) => (
                    <li key={feature}>
                      {feature}
                    </li>
                  )
                )}
              </ul>
            </article>
          ))}
        </div>

        <p className="pricing-disclaimer">
          Pricing and plan contents are proposals
          only, not current product offers.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT AND SECURITY
// ============================================================

function AboutAndSecurity() {
  return (
    <section
      className="section about-section"
      id="about"
    >
      <div className="container about-layout">
        <div>
          <h2>
            Built for people with

            <span className="gradient-text">
              {" "}
              bigger ambitions.
            </span>
          </h2>

          <p>
            Organix AI is designed around
            a simple idea: your tasks,
            time, projects and financial
            responsibilities should work
            together instead of living
            in separate systems.
          </p>

          <p>
            Our goal is to create an
            intelligent, accessible
            workspace that makes everyday
            organization feel effortless.
          </p>

          <a
            href="/register"
            className="text-link"
          >
            Discover the workspace

            <ArrowRight size={17} />
          </a>
        </div>

        <div className="security-card">
          <h3>
            Privacy by design
          </h3>

          <p>
            We are designing Organix AI
            with secure authentication,
            account-level data isolation
            and responsible AI handling
            in mind.
          </p>

          <div className="security-items">
            <span>
              Secure session design
            </span>

            <span>
              Account-level access control
            </span>

            <span>
              Privacy-conscious AI integration
            </span>
          </div>

          <small>
            These are planned engineering
            principles. Security implementation
            and independent verification are
            separate development steps.
          </small>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================

function FAQ() {
  const [openIndex, setOpenIndex] =
    useState<number | null>(0);

  return (
    <section
      className="section faq-section"
      id="faq"
    >
      <div className="container faq-layout">
        <div>
          <h2>
            Frequently asked questions.
          </h2>

          <p>
            Everything you need to know
            about the Organix AI concept
            and its interactive preview.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map(
            (faq, index) => (
              <div
                className={`faq-item ${
                  openIndex === index
                    ? "open"
                    : ""
                }`}
                key={faq.question}
              >
                <button
                  type="button"
                  aria-expanded={
                    openIndex === index
                  }
                  onClick={() =>
                    setOpenIndex(
                      openIndex === index
                        ? null
                        : index
                    )
                  }
                >
                  {faq.question}

                  <ChevronDown size={20} />
                </button>

                {openIndex === index && (
                  <p>
                    {faq.answer}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CALL TO ACTION
// ============================================================

function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="container">
        <div className="final-cta">
          <h2>
            Less chaos. More focus.

            <br />

            <span>
              Everything in its place.
            </span>
          </h2>

          <p>
            Take the first step toward
            a more organized, productive
            and intentional life with
            Organix AI.
          </p>

          <a
            href="/register"
            className="btn btn-white btn-large"
          >
            Create Your Account

            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================

function Footer() {
  const links = [
    {
      title: "Product",
      items: [
        [
          "Features",
          "#features",
        ],
        [
          "AI Assistant",
          "#ai",
        ],
        [
          "Product Demo",
          "#showcase",
        ],
        [
          "Pricing",
          "#pricing",
        ],
      ],
    },
    {
      title: "Company",
      items: [
        [
          "About",
          "#about",
        ],
        [
          "How It Works",
          "#how-it-works",
        ],
        [
          "FAQ",
          "#faq",
        ],
      ],
    },
    {
      title: "Account",
      items: [
        [
          "Log In",
          "/login",
        ],
        [
          "Register",
          "/register",
        ],
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Logo />

            <p>
              Your life. Your tasks.
              One intelligent workspace.
              Organize smarter and
              achieve more.
            </p>

          </div>

          {links.map(
            (group) => (
              <div
                className="footer-links"
                key={group.title}
              >
                <strong>
                  {group.title}
                </strong>

                {group.items.map(
                  ([
                    label,
                    href,
                  ]) => (
                    <a
                      key={label}
                      href={href}
                    >
                      {label}
                    </a>
                  )
                )}
              </div>
            )
          )}
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Organix AI.
            All rights reserved.
          </span>

          <span>
            Designed for a smarter
            way to work.
          </span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN APPLICATION
// ============================================================

export default function App() {
  const [theme, setTheme] =
    useState<Theme>(() => {
      try {
        return localStorage.getItem(
          "organix-theme"
        ) === "light"
          ? "light"
          : "dark";
      } catch {
        return "dark";
      }
    });

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    try {
      localStorage.setItem(
        "organix-theme",
        theme
      );
    } catch {
      // Continue without persistent storage.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  }

  return (
    <>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        <Hero />

        <Features />

        <AIAssistant />

        <Showcase />

        <Analytics />

        <HowItWorks />

        <Pricing />

        <AboutAndSecurity />

        <FAQ />

        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
