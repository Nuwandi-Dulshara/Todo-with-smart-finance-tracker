import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ProgressBar from '../components/common/ProgressBar'
import TaskSummaryCards from '../components/tasks/TaskSummaryCards'
import TaskTable from '../components/tasks/TaskTable'
import TaskToolbar from '../components/tasks/TaskToolbar'
import { api } from '../services/api'
import { getTaskStats, readableLongDate, todayInput } from '../utils/taskHelpers'

const sortOptions = [
  { label: 'Due time', value: 'dueTime' },
  { label: 'Priority', value: 'priority' },
  { label: 'Recently created', value: 'createdAt' },
]

function TodayActivities({ tasks, refreshKey, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
  const today = todayInput()
  const [todayData, setTodayData] = useState(null)
  const [visibleTasks, setVisibleTasks] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
    sort: 'dueTime',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(() => {
    const source = todayData?.allTodayTasks?.length ? todayData.allTodayTasks : tasks
    return [...new Set(source.map((task) => task.category).filter(Boolean))].sort()
  }, [tasks, todayData])

  const stats = getTaskStats(todayData?.allTodayTasks ?? visibleTasks)
  const completed = todayData?.completedToday ?? stats.completed
  const progress = stats.total ? (completed / stats.total) * 100 : 0
  const progressMessage =
    progress >= 100 ? 'Today is fully complete.' : progress > 0 ? 'Keep the momentum going.' : 'Ready for the first win.'

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
        if (isMounted && data) setTodayData(data)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to load today activities. Please try again.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      const params = {
        due_date: today,
        search,
        status: filters.status !== 'All' ? filters.status : '',
        priority: filters.priority !== 'All' ? filters.priority : '',
        category: filters.category !== 'All' ? filters.category : '',
        sort: filters.sort,
      }

      api
        .getTasks(params)
        .then((data) => {
          if (isMounted) setVisibleTasks(data)
        })
        .catch((requestError) => {
          if (isMounted) setError(requestError.message || 'Unable to load tasks. Please try again.')
        })
    }, 280)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [filters, refreshKey, search, today])

  const changeFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="page-grid">
      <section className="page-hero elevated-hero">
        <div>
          <p className="eyebrow">Today Activities</p>
          <h1>{readableLongDate()}</h1>
          <p className="hero-subtitle">Plan, track and complete today's work.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask(today)}>
          <Plus size={18} />
          Add Today Task
        </button>
      </section>

      {isLoading && <div className="app-message">Loading today activities...</div>}
      {error && <div className="app-message error-message">{error}</div>}

      <TaskSummaryCards totalLabel="Total Today" stats={stats} />

      <section className="panel progress-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Today's Progress</p>
            <h2>
              {completed} of {stats.total} completed
            </h2>
          </div>
          <strong className="progress-percent">{Math.round(progress)}% complete</strong>
        </div>
        <ProgressBar value={progress} label={progressMessage} />
      </section>

      <TaskToolbar
        search={search}
        placeholder="Search today's tasks..."
        filters={filters}
        categories={categories}
        sortOptions={sortOptions}
        onSearchChange={setSearch}
        onFilterChange={changeFilter}
        onSortChange={(value) => changeFilter('sort', value)}
      />

      <section className="panel task-section-panel">
        <TaskTable
          tasks={visibleTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          emptyText="No tasks match your filters."
        />
      </section>
    </div>
  )
}

export default TodayActivities
