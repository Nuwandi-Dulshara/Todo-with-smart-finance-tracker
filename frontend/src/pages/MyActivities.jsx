import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskSummaryCards from '../components/tasks/TaskSummaryCards'
import TaskTable from '../components/tasks/TaskTable'
import TaskToolbar from '../components/tasks/TaskToolbar'
import { api } from '../services/api'
import { getTaskStats, isOverdueTask, sortedByDue, todayInput } from '../utils/taskHelpers'

const sortOptions = [
  { label: 'Due date', value: 'dueDate' },
  { label: 'Created date', value: 'createdAt' },
  { label: 'Priority', value: 'priority' },
]

function MyActivities({
  tasks,
  isLoading,
  error,
  refreshKey,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onRefresh,
}) {
  const [searchParams] = useSearchParams()
  const highlightedTask = searchParams.get('task')
  const [visibleTasks, setVisibleTasks] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
    dateRange: 'All Dates',
    customDate: '',
    sort: 'dueDate',
  })
  const [pageError, setPageError] = useState('')

  const categories = useMemo(
    () => [...new Set(tasks.map((task) => task.category).filter(Boolean))].sort(),
    [tasks],
  )
  const stats = getTaskStats(tasks)

  useEffect(() => {
    onRefresh()
  }, [onRefresh])

  useEffect(() => {
    let isMounted = true
    const timeout = setTimeout(() => {
      const params = {
        search,
        status: filters.status !== 'All' ? filters.status : '',
        priority: filters.priority !== 'All' ? filters.priority : '',
        category: filters.category !== 'All' ? filters.category : '',
        due_date:
          filters.dateRange === 'Today'
            ? todayInput()
            : filters.dateRange === 'Custom'
              ? filters.customDate
              : '',
        sort: filters.sort,
      }

      api
        .getTasks(params)
        .then((data) => {
          const filtered = data.filter((task) => {
            if (filters.dateRange === 'Upcoming') {
              return task.dueDate > todayInput() && task.status !== 'Completed'
            }
            if (filters.dateRange === 'Overdue') return isOverdueTask(task)
            return true
          })
          const ordered = highlightedTask
            ? [...filtered].sort((task) => (String(task.id) === highlightedTask ? -1 : 0))
            : filtered
          if (isMounted) setVisibleTasks(filters.sort === 'dueDate' ? sortedByDue(ordered) : ordered)
        })
        .catch((requestError) => {
          if (isMounted) setPageError(requestError.message || 'Unable to load tasks. Please try again.')
        })
    }, 280)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [filters, highlightedTask, refreshKey, search])

  const changeFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="page-grid">
      <section className="page-hero elevated-hero">
        <div>
          <p className="eyebrow">My Activities</p>
          <h1>Plan, edit, and finish your tasks.</h1>
          <p className="hero-subtitle">Search, filter and update every task in one focused workspace.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask()}>
          <Plus size={18} />
          Add Task
        </button>
      </section>

      {isLoading && <div className="app-message">Loading tasks...</div>}
      {(error || pageError) && <div className="app-message error-message">{error || pageError}</div>}

      <TaskSummaryCards stats={stats} />

      <TaskToolbar
        search={search}
        placeholder="Search tasks..."
        filters={filters}
        categories={categories}
        showDateFilter
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

export default MyActivities
