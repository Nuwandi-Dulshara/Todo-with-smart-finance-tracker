export type TaskPriority = "High" | "Medium" | "Low";
export type TransactionType = "income" | "expense";
export type Task = {
  id: string;
  title: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};
export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  taskId?: string | null;
  createdAt: string;
};
export type WidgetKey = "tasks" | "finances" | "priorities" | "transactions" | "deadlines" | "activity" | "insights" | "weekly" | "linked";
export type WidgetSettings = Record<WidgetKey, boolean>;
export type DashboardUser = { id: string; full_name: string; email: string };
export type DashboardData = {
  user: DashboardUser;
  tasks: Task[];
  transactions: Transaction[];
  monthlyBudget: number;
  widgets: WidgetSettings;
};

export const defaultWidgets: WidgetSettings = {
  tasks: true, finances: true, priorities: true, transactions: true,
  deadlines: true, activity: true, insights: true, weekly: true, linked: true,
};

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");

export class DashboardApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
  }
}

export async function dashboardRequest<T>(
  path = "",
  options: { method?: string; body?: unknown; signal?: AbortSignal; requestKey?: string } = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(15_000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  try {
    const response = await fetch(`${API_BASE}/dashboard${path}`, {
      method: options.method || "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options.requestKey ? { "Idempotency-Key": options.requestKey } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });
    if (response.status === 401) {
      throw new DashboardApiError("Your session has expired. Please sign in again.", 401);
    }
    const body = await response.json().catch(() => {
      throw new DashboardApiError("The server returned an invalid response. Please try again.", response.status);
    });
    if (!response.ok) {
      const detail = body?.detail;
      const message = typeof detail === "string" ? detail : Array.isArray(detail)
        ? detail.map((item: { msg?: string }) => item.msg || "Invalid value").join(" ")
        : "Unable to save or load your workspace. Please try again.";
      throw new DashboardApiError(message, response.status);
    }
    return body as T;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new DashboardApiError("The server took too long to respond. Please try again.", 0);
    }
    if (error instanceof DashboardApiError) throw error;
    throw new DashboardApiError("Unable to reach the backend. Please check that the API is running.", 0);
  }
}
