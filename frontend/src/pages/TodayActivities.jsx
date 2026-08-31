import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import ProgressBar from '../components/common/ProgressBar'
import StatCard from '../components/common/StatCard'
import TaskList from '../components/tasks/TaskList'
import { api } from '../services/api'
import { getTaskStats, isToday, readableLongDate, sortedByDue } from '../utils/taskHelpers'

function TodayActivities({ tasks, refreshKey, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
  const [todayData, setTodayData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const todaysTasks = sortedByDue(todayData?.allTodayTasks ?? tasks.filter((task) => isToday(task.dueDate)))
  const stats = getTaskStats(todaysTasks)
  const completed = todayData?.completedToday ?? stats.completed
  const pending = todayData?.pendingToday ?? stats.pending
  const progress = todaysTasks.length ? (completed / todaysTasks.length) * 100 : 0

  useEffect(() => {
    let isMounted = true
    Promise.resolve()
      .then(() => {
        if (!isMounted) return null
        setIsLoading(true)
        setError('')
        return api.getTodayTasks()
      })
      .then((data) => {
        if (isMounted) setTodayData(data)
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
          <p className="eyebrow">Today Activities</p>
          <h1>{readableLongDate()}</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask()}>
          <Plus size={18} />
          Quick Add Task
        </button>
      </section>
      {isLoading && <div className="app-message">Loading today activities...</div>}
      {error && <div className="app-message error-message">{error}</div>}
      <section className="stats-grid">
        <StatCard label="Total Today" value={stats.total} />
        <StatCard label="Completed" value={completed} tone="green" />
        <StatCard label="Pending" value={pending} tone="amber" />
        <StatCard label="Overdue" value={stats.overdue} tone="red" />
      </section>
      <section className="panel">
        <ProgressBar value={progress} label="Daily progress" />
      </section>
      <section className="panel">
        <TaskList
          tasks={todaysTasks}
          compact
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          emptyText="No tasks scheduled for today."
        />
      </section>
    </div>
  )
}

export default TodayActivities
