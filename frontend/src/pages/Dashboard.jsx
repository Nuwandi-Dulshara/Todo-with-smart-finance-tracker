import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProgressBar from '../components/common/ProgressBar'
import StatCard from '../components/common/StatCard'
import TaskList from '../components/tasks/TaskList'
import { api } from '../services/api'
import { getTaskStats, isToday, readableLongDate, sortedByDue } from '../utils/taskHelpers'

function Dashboard({ tasks, refreshKey, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
  const [summary, setSummary] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fallbackStats = getTaskStats(tasks)

  const todayCompleted = summary?.today_completed ?? todayTasks.filter((task) => task.status === 'Completed').length
  const todayTotal = summary?.today_tasks ?? todayTasks.length
  const progress = todayTotal ? (todayCompleted / todayTotal) * 100 : 0

  const upcomingTasks = useMemo(
    () =>
      sortedByDue(tasks.filter((task) => !isToday(task.dueDate) && task.status !== 'Completed')).slice(0, 5),
    [tasks],
  )

  useEffect(() => {
    let isMounted = true
    Promise.resolve()
      .then(() => {
        if (!isMounted) return null
        setIsLoading(true)
        setError('')
        return Promise.all([api.getDashboardSummary(), api.getDashboardRecent(5), api.getTodayTasks()])
      })
      .then((result) => {
        if (!result || !isMounted) return
        const [summaryData, recentData, todayData] = result
        setSummary(summaryData)
        setRecentTasks(recentData)
        setTodayTasks(todayData.allTodayTasks)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to load dashboard. Please try again.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return (
    <div className="page-grid dashboard-page">
      <section className="page-hero elevated-hero dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Focus on the work that matters today.</h1>
          <p className="hero-subtitle">{readableLongDate()} · Your task flow is synced with the backend.</p>
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
        <div className="panel progress-card dashboard-progress">
          <div className="section-head">
            <div>
              <p className="eyebrow">Today's Progress</p>
              <h2>
                {todayCompleted} of {todayTotal} tasks completed
              </h2>
            </div>
            <strong className="progress-percent">{Math.round(progress)}%</strong>
          </div>
          <ProgressBar value={progress} label="Daily completion" />
        </div>
        <div className="panel productivity-card">
          <p className="eyebrow">Productivity</p>
          <h2>{summary?.completion_percentage ?? 0}% overall completion</h2>
          <p className="hero-subtitle">
            {summary?.today_pending ?? 0} tasks still need attention today.
          </p>
        </div>
      </section>

      <section className="three-column-dashboard">
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Today's Tasks</p>
              <h2>Most important today</h2>
            </div>
            <Link className="secondary-button" to="/today">
              View All Today Tasks
            </Link>
          </div>
          <TaskList
            tasks={sortedByDue(todayTasks).slice(0, 4)}
            compact
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            emptyText="No tasks scheduled for today."
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
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recent Activity</p>
              <h2>Latest changes</h2>
            </div>
          </div>
          <TaskList
            tasks={recentTasks}
            compact
            emptyText="No recent activity yet."
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
