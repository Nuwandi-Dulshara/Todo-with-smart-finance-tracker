const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const statusFromApi = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const statusToApi = {
  'To Do': 'pending',
  'In Progress': 'in_progress',
  Completed: 'completed',
  Overdue: 'pending',
}

const priorityFromApi = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const priorityToApi = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

const request = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.detail || 'TaskFlow request failed.')
    }

    if (response.status === 204) return null
    return response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to TaskFlow server.', { cause: error })
    }
    throw error
  }
}

export const mapTaskFromApi = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  category: task.category || 'General',
  priority: priorityFromApi[task.priority] || 'Medium',
  status: statusFromApi[task.status] || 'To Do',
  dueDate: task.due_date,
  dueTime: task.due_time ? task.due_time.slice(0, 5) : '',
  estimatedMinutes: task.estimated_minutes ?? '',
  spentMinutes: task.spent_minutes ?? 0,
  isCompleted: task.is_completed,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  completedAt: task.completed_at,
})

export const mapTaskToApi = (task) => ({
  title: task.title,
  description: task.description || null,
  category: task.category || null,
  priority: priorityToApi[task.priority] || 'medium',
  status: statusToApi[task.status] || 'pending',
  due_date: task.dueDate,
  due_time: task.dueTime || null,
  estimated_minutes:
    task.estimatedMinutes === '' || task.estimatedMinutes === null
      ? null
      : Number(task.estimatedMinutes),
})

export const mapNotificationFromApi = (notification) => ({
  id: `${notification.type}-${notification.task_id}`,
  taskId: notification.task_id,
  type: notification.type === 'missed_today' ? 'today' : notification.type,
  title: notification.type === 'overdue' ? 'Task overdue' : 'Missed today',
  message: `${notification.title}: ${notification.message}`,
  dueDate: notification.due_date,
  dueTime: notification.due_time ? notification.due_time.slice(0, 5) : '',
  read: false,
})

export const api = {
  health: () => request('/health'),
  getTasks: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value)
    })
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return request(`/tasks${suffix}`).then((tasks) => tasks.map(mapTaskFromApi))
  },
  createTask: (task) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(mapTaskToApi(task)),
    }).then(mapTaskFromApi),
  getTask: (taskId) => request(`/tasks/${taskId}`).then(mapTaskFromApi),
  updateTask: (taskId, task) =>
    request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(mapTaskToApi(task)),
    }).then(mapTaskFromApi),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE' }),
  completeTask: (taskId, isCompleted) =>
    request(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    }).then(mapTaskFromApi),
  updateTaskStatus: (taskId, status) =>
    request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: statusToApi[status] || 'pending' }),
    }).then(mapTaskFromApi),
  updateTaskTime: (taskId, spentMinutes) =>
    request(`/tasks/${taskId}/time`, {
      method: 'PATCH',
      body: JSON.stringify({ spent_minutes: Number(spentMinutes) }),
    }).then(mapTaskFromApi),
  getTodayTasks: () =>
    request('/tasks/today').then((data) => ({
      allTodayTasks: data.all_today_tasks.map(mapTaskFromApi),
      completedToday: data.completed_today,
      pendingToday: data.pending_today,
      inProgressToday: data.in_progress_today,
    })),
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardRecent: (limit = 5) =>
    request(`/dashboard/recent?limit=${limit}`).then((tasks) => tasks.map(mapTaskFromApi)),
  getCalendar: (month, year) =>
    request(`/calendar?month=${month}&year=${year}`).then((data) => ({
      month: data.month,
      year: data.year,
      tasks: data.tasks.map(mapTaskFromApi),
    })),
  getCalendarDate: (date) => request(`/calendar/${date}`).then((tasks) => tasks.map(mapTaskFromApi)),
  getTimeSummary: () => request('/time-management/summary'),
  getNotifications: () =>
    request('/notifications').then((data) => ({
      count: data.count,
      notifications: data.notifications.map(mapNotificationFromApi),
    })),
}
