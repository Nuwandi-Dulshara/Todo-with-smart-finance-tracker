import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import DeleteTaskDialog from './components/tasks/DeleteTaskDialog'
import TaskForm from './components/tasks/TaskForm'
import ProtectedExpenseRoute from './expense-tracker/components/ProtectedExpenseRoute'
import ExpenseTrackerLayout from './expense-tracker/layouts/ExpenseTrackerLayout'
import AddExpensePage from './expense-tracker/pages/AddExpensePage'
import BudgetsPage from './expense-tracker/pages/BudgetsPage'
import EditExpensePage from './expense-tracker/pages/EditExpensePage'
import ExpenseDashboard from './expense-tracker/pages/ExpenseDashboard'
import ExpensesPage from './expense-tracker/pages/ExpensesPage'
import SmartInsightsPage from './expense-tracker/pages/SmartInsightsPage'
import UnusualExpensesPage from './expense-tracker/pages/UnusualExpensesPage'
import './expense-tracker/styles/expenseTracker.css'
import Calendar from './pages/Calendar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MyActivities from './pages/MyActivities'
import Notifications from './pages/Notifications'
import Register from './pages/Register'
import TimeManage from './pages/TimeManage'
import TodayActivities from './pages/TodayActivities'
import { api } from './services/api'
import { isOverdueTask } from './utils/taskHelpers'

const AUTH_STORAGE_KEY = 'task-flow-session'
const EXPENSE_DASHBOARD_PATH = '/expense-tracker/dashboard'

const getStoredSession = () => {
  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return storedSession ? JSON.parse(storedSession) : null
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState(getStoredSession)
  const [tasks, setTasks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [readNotifications, setReadNotifications] = useState([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState(false)
  const [appError, setAppError] = useState('')
  const [appNotice, setAppNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [taskModal, setTaskModal] = useState({ open: false, task: null, date: '' })
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = Boolean(session?.access_token)

  const refreshTasks = useCallback(async () => {
    setIsLoadingTasks(true)
    setAppError('')
    try {
      const taskData = await api.getTasks()
      setTasks(taskData)
    } catch (error) {
      setAppError(error.message || 'Unable to connect to Organix AI server.')
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
    setAppNotice('')
    try {
      if (taskInput.id) {
        await api.updateTask(taskInput.id, taskInput)
        setAppNotice('Task updated successfully.')
      } else {
        await api.createTask(taskInput)
        setAppNotice('Task created successfully.')
      }
      closeTaskModal()
      await refreshBackendData()
    } catch (error) {
      setAppError(error.message || 'Unable to save task.')
    } finally {
      setIsSavingTask(false)
    }
  }

  const requestDeleteTask = (taskId) => {
    const task = normalizedTasks.find((item) => item.id === taskId)
    if (task) setDeleteCandidate(task)
  }

  const deleteTask = async () => {
    if (!deleteCandidate) return
    const taskId = deleteCandidate.id
    setIsDeletingTask(true)
    setAppError('')
    setAppNotice('')
    try {
      await api.deleteTask(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
      setDeleteCandidate(null)
      setAppNotice('Task deleted successfully.')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setAppError(error.message || 'Unable to delete task.')
    } finally {
      setIsDeletingTask(false)
    }
  }

  const cancelDeleteTask = () => {
    if (!isDeletingTask) setDeleteCandidate(null)
  }

  const updateTask = async (taskId, updates) => {
    setAppError('')
    setAppNotice('')
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
      setAppNotice('Task updated successfully.')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setAppError(error.message || 'Unable to update task.')
    }
  }

  const updateTaskTime = async (taskId, spentMinutes) => {
    setAppError('')
    setAppNotice('')
    try {
      const updatedTask = await api.updateTaskTime(taskId, spentMinutes)
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
      setAppNotice('Focus time saved.')
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

  const handleLogin = (authSession) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession))
    setSession(authSession)
    navigate(EXPENSE_DASHBOARD_PATH, { replace: true })
  }

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
    navigate('/', { replace: true })
  }

  const sharedProps = {
    tasks: normalizedTasks,
    isLoading: isLoadingTasks,
    error: appError,
    refreshKey,
    onAddTask: openAddTask,
    onEditTask: openEditTask,
    onDeleteTask: requestDeleteTask,
    onUpdateTask: updateTask,
  }

  if (location.pathname.startsWith('/expense-tracker')) {
    return (
      <Routes>
        <Route
          path="/expense-tracker"
          element={
            <ProtectedExpenseRoute isAuthenticated={isAuthenticated}>
              <ExpenseTrackerLayout onLogout={handleLogout} />
            </ProtectedExpenseRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ExpenseDashboard />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="expenses/add" element={<AddExpensePage />} />
          <Route path="expenses/:id/edit" element={<EditExpensePage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="insights" element={<SmartInsightsPage />} />
          <Route path="unusual-expenses" element={<UnusualExpensesPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    )
  }

  if (location.pathname === '/login') {
    return isAuthenticated ? (
      <Navigate to={EXPENSE_DASHBOARD_PATH} replace />
    ) : (
      <Login onLogin={handleLogin} />
    )
  }

  if (location.pathname === '/signup') {
    return isAuthenticated ? (
      <Navigate to={EXPENSE_DASHBOARD_PATH} replace />
    ) : (
      <Register onRegister={handleLogin} />
    )
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <Topbar
          unreadCount={notificationCount}
          isAuthenticated={isAuthenticated}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="page-shell">
          {appError && <div className="app-message error-message">{appError}</div>}
          {appNotice && <div className="app-message success-message">{appNotice}</div>}
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
            <Route path="/welcome" element={<Navigate to={EXPENSE_DASHBOARD_PATH} replace />} />
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
      <DeleteTaskDialog
        task={deleteCandidate}
        isDeleting={isDeletingTask}
        onCancel={cancelDeleteTask}
        onConfirm={deleteTask}
      />
    </div>
  )
}

export default App
