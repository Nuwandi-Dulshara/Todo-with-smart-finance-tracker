export const statusOptions = ['To Do', 'In Progress', 'Completed']
export const priorityOptions = ['Low', 'Medium', 'High']
export const categoryOptions = ['Work', 'Meetings', 'Development', 'Design', 'Admin', 'Personal', 'General']

export const pad = (value) => String(value).padStart(2, '0')

export const formatDateInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const todayInput = () => formatDateInput(new Date())

export const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const toTaskDate = (task) => new Date(`${task.dueDate}T${task.dueTime || '23:59'}`)

export const isToday = (dateInput) => dateInput === todayInput()

export const isOverdueTask = (task) => {
  if (task.status === 'Completed') return false
  return toTaskDate(task).getTime() < Date.now()
}

export const sortedByDue = (tasks) =>
  [...tasks].sort((a, b) => toTaskDate(a).getTime() - toTaskDate(b).getTime())

export const getTaskStats = (tasks) => {
  const completed = tasks.filter((task) => task.status === 'Completed').length
  const overdue = tasks.filter((task) => task.status === 'Overdue' || isOverdueTask(task)).length
  const pending = tasks.length - completed
  return { total: tasks.length, completed, pending, overdue }
}

export const getPriorityClass = (priority) => `priority-${priority.toLowerCase()}`

export const getStatusClass = (status) => `status-${status.toLowerCase().replace(/\s+/g, '-')}`

export const readableDate = (dateInput) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateInput}T12:00`))

export const readableLongDate = (date = new Date()) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

export const minutesUntilDue = (task) =>
  Math.round((toTaskDate(task).getTime() - Date.now()) / 60000)

export const buildNotifications = (tasks, readIds = []) => {
  const notifications = []
  const unfinishedToday = tasks.filter((task) => isToday(task.dueDate) && task.status !== 'Completed')

  unfinishedToday.forEach((task) => {
    notifications.push({
      id: `today-${task.id}`,
      taskId: task.id,
      type: 'today',
      title: 'Unfinished today',
      message: `${task.title} is still pending today.`,
      read: readIds.includes(`today-${task.id}`),
    })
  })

  tasks
    .filter((task) => task.status !== 'Completed' && isOverdueTask(task))
    .forEach((task) => {
      notifications.push({
        id: `overdue-${task.id}`,
        taskId: task.id,
        type: 'overdue',
        title: 'Task overdue',
        message: `${task.title} is overdue.`,
        read: readIds.includes(`overdue-${task.id}`),
      })
    })

  tasks
    .filter((task) => {
      const minutes = minutesUntilDue(task)
      return task.status !== 'Completed' && minutes > 0 && minutes <= 120
    })
    .forEach((task) => {
      notifications.push({
        id: `soon-${task.id}`,
        taskId: task.id,
        type: 'soon',
        title: 'Due soon',
        message: `${task.title} is approaching its due time.`,
        read: readIds.includes(`soon-${task.id}`),
      })
    })

  if (unfinishedToday.length > 0) {
    notifications.unshift({
      id: 'today-summary',
      taskId: unfinishedToday[0].id,
      type: 'summary',
      title: 'Today summary',
      message: `You have ${unfinishedToday.length} unfinished tasks today.`,
      read: readIds.includes('today-summary'),
    })
  }

  return notifications
}
