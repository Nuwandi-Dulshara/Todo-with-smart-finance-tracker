import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import TaskForm from './components/tasks/TaskForm'
import Calendar from './pages/Calendar'
import Dashboard from './pages/Dashboard'
import MyActivities from './pages/MyActivities'
import Notifications from './pages/Notifications'
import TimeManage from './pages/TimeManage'
import TodayActivities from './pages/TodayActivities'
import { api } from './services/api'
import { isOverdueTask } from './utils/taskHelpers'

function App() {
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [readNotifications, setReadNotifications] = useState([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [appError, setAppError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [taskModal, setTaskModal] = useState({ open: false, task: null, date: '' })
  const navigate = useNavigate()

  const refreshTasks = useCallback(async () => {
    setIsLoadingTasks(true)
    setAppError('')
    try {
      const taskData = await api.getTasks()
      setTasks(taskData)
    } catch (error) {
      setAppError(error.message || 'Unable to connect to TaskFlow server.')
    } finally {
      setIsLoadingTasks(false)
    }
  }, [])

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications()
      setNotificationCount(data.count)
      setNotifications(
        data.notifications.map((notification) => ({
          ...notification,
          read: readNotifications.includes(notification.id),
        })),
      )
    } catch {
      setNotificationCount(0)
    }
  }, [readNotifications])

  const refreshBackendData = useCallback(async () => {
    await refreshTasks()
    setRefreshKey((current) => current + 1)
  }, [refreshTasks])

  useEffect(() => {
    Promise.resolve().then(refreshBackendData)
  }, [refreshBackendData])

  useEffect(() => {
    Promise.resolve().then(refreshNotifications)
  }, [refreshNotifications, refreshKey])

  const normalizedTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        status: task.status !== 'Completed' && isOverdueTask(task) ? 'Overdue' : task.status,
      })),
    [tasks],
  )

  const openAddTask = (date = '') => setTaskModal({ open: true, task: null, date })
  const openEditTask = (task) => setTaskModal({ open: true, task, date: '' })
  const closeTaskModal = () => setTaskModal({ open: false, task: null, date: '' })

  const saveTask = async (taskInput) => {
    setIsSavingTask(true)
    setAppError('')
    try {
      if (taskInput.id) {
        await api.updateTask(taskInput.id, taskInput)
      } else {
        await api.createTask(taskInput)
      }
      closeTaskModal()
      await refreshBackendData()
    } catch (error) {
      setAppError(error.message || 'Unable to save task.')
    } finally {
      setIsSavingTask(false)
    }
  }

  const deleteTask = async (taskId) => {
    setAppError('')
    try {
      await api.deleteTask(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setAppError(error.message || 'Unable to delete task.')
    }
  }

  const updateTask = async (taskId, updates) => {
    setAppError('')
    try {
      const currentTask = normalizedTasks.find((task) => task.id === taskId)
      if (updates.status === 'Completed' || updates.status === 'To Do') {
        const updatedTask = await api.completeTask(taskId, updates.status === 'Completed')
        setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      } else if (updates.status) {
        const updatedTask = await api.updateTaskStatus(taskId, updates.status)
        setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      } else if (currentTask) {
        const updatedTask = await api.updateTask(taskId, { ...currentTask, ...updates })
        setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      }
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setAppError(error.message || 'Unable to update task.')
    }
  }

  const updateTaskTime = async (taskId, spentMinutes) => {
    setAppError('')
    try {
      const updatedTask = await api.updateTaskTime(taskId, spentMinutes)
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setAppError(error.message || 'Unable to update task time.')
    }
  }

  const markNotificationRead = (notificationId) => {
    setReadNotifications((current) =>
      current.includes(notificationId) ? current : [...current, notificationId],
    )
  }

  const clearNotification = (notificationId) => {
    markNotificationRead(notificationId)
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId))
  }

  const openTaskFromNotification = (taskId, notificationId) => {
    markNotificationRead(notificationId)
    navigate(`/activities?task=${taskId}`)
  }

  const sharedProps = {
    tasks: normalizedTasks,
    isLoading: isLoadingTasks,
    error: appError,
    refreshKey,
    onAddTask: openAddTask,
    onEditTask: openEditTask,
    onDeleteTask: deleteTask,
    onUpdateTask: updateTask,
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <Topbar unreadCount={notificationCount} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-shell">
          {appError && <div className="app-message error-message">{appError}</div>}
          <Routes>
            <Route path="/" element={<Dashboard {...sharedProps} />} />
            <Route path="/activities" element={<MyActivities {...sharedProps} onRefresh={refreshTasks} />} />
            <Route path="/today" element={<TodayActivities {...sharedProps} />} />
            <Route path="/calendar" element={<Calendar {...sharedProps} />} />
            <Route
              path="/time"
              element={
                <TimeManage
                  tasks={normalizedTasks}
                  refreshKey={refreshKey}
                  error={appError}
                  onUpdateTaskTime={updateTaskTime}
                />
              }
            />
            <Route
              path="/notifications"
              element={
                <Notifications
                  notifications={notifications}
                  error={appError}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={() =>
                    setReadNotifications(notifications.map((notification) => notification.id))
                  }
                  onClear={clearNotification}
                  onOpenTask={openTaskFromNotification}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {taskModal.open && (
        <TaskForm
          task={taskModal.task}
          defaultDate={taskModal.date}
          isSaving={isSavingTask}
          onSave={saveTask}
          onCancel={closeTaskModal}
        />
      )}
    </div>
  )
}

export default App
