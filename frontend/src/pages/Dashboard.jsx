import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import ProgressBar from '../components/common/ProgressBar'
import StatCard from '../components/common/StatCard'
import TaskList from '../components/tasks/TaskList'
import { api } from '../services/api'
import { getTaskStats, isToday, sortedByDue } from '../utils/taskHelpers'

function Dashboard({ tasks, refreshKey, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
  const [summary, setSummary] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fallbackStats = getTaskStats(tasks)
  const todaysTasks = sortedByDue(tasks.filter((task) => isToday(task.dueDate)))
  const todayCompleted = summary?.today_completed ?? todaysTasks.filter((task) => task.status === 'Completed').length
  const todayTotal = summary?.today_tasks ?? todaysTasks.length
  const progress = todayTotal ? (todayCompleted / todayTotal) * 100 : 0
  const upcomingTasks = recentTasks.length
    ? recentTasks
    : sortedByDue(
    tasks.filter((task) => !isToday(task.dueDate) && task.status !== 'Completed'),
  ).slice(0, 4)

  useEffect(() => {
    let isMounted = true
    Promise.resolve()
      .then(() => {
        if (!isMounted) return null
        setIsLoading(true)
        setError('')
        return Promise.all([api.getDashboardSummary(), api.getDashboardRecent(5)])
      })
      .then((result) => {
        if (!result) return
        const [summaryData, recentData] = result
        if (!isMounted) return
        setSummary(summaryData)
        setRecentTasks(recentData)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to connect to TaskFlow server.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return (
    <div className="page-grid">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Good rhythm starts with today.</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask()}>
          <Plus size={18} />
          Add Task
        </button>
      </section>
      {isLoading && <div className="app-message">Loading dashboard data...</div>}
      {error && <div className="app-message error-message">{error}</div>}

      <section className="stats-grid">
        <StatCard icon={ListTodo} label="Total Tasks" value={summary?.total_tasks ?? fallbackStats.total} />
        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={summary?.completed_tasks ?? fallbackStats.completed}
          tone="green"
        />
        <StatCard
          icon={Clock3}
          label="Pending Tasks"
          value={summary?.pending_tasks ?? fallbackStats.pending}
          tone="amber"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Tasks"
          value={summary?.overdue_tasks ?? fallbackStats.overdue}
          tone="red"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Today's Progress</p>
              <h2>
                {todayCompleted} of {todayTotal} tasks completed
              </h2>
            </div>
          </div>
          <ProgressBar value={progress} label="Daily completion" />
        </div>
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Quick Add Task</p>
              <h2>Capture the next thing</h2>
            </div>
            <button className="primary-button compact-button" type="button" onClick={() => onAddTask()}>
              <Plus size={17} />
              Add Task
            </button>
          </div>
        </div>
      </section>

      <section className="two-column">
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Today's Tasks</p>
              <h2>Scheduled for today</h2>
            </div>
          </div>
          <TaskList
            tasks={todaysTasks.slice(0, 5)}
            compact
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
          />
        </div>
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Upcoming Tasks</p>
              <h2>Next on deck</h2>
            </div>
          </div>
          <TaskList
            tasks={upcomingTasks}
            compact
            emptyText="No upcoming tasks."
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
          />
        </div>
      </section>
    </div>
  )
}

export default Dashboard
