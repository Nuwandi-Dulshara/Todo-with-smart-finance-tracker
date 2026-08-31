import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskList from '../components/tasks/TaskList'
import { categoryOptions, priorityOptions, sortedByDue, statusOptions } from '../utils/taskHelpers'

function MyActivities({ tasks, isLoading, error, onAddTask, onEditTask, onDeleteTask, onUpdateTask, onRefresh }) {
  const [searchParams] = useSearchParams()
  const highlightedTask = searchParams.get('task')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'All', priority: 'All', category: 'All' })
  const [sort, setSort] = useState('due-asc')

  const visibleTasks = useMemo(() => {
    let next = tasks.filter((task) => {
      const term = `${task.title} ${task.description} ${task.category}`.toLowerCase()
      return (
        term.includes(search.toLowerCase()) &&
        (filters.status === 'All' || task.status === filters.status) &&
        (filters.priority === 'All' || task.priority === filters.priority) &&
        (filters.category === 'All' || task.category === filters.category)
      )
    })

    if (sort === 'due-desc') next = sortedByDue(next).reverse()
    if (sort === 'due-asc') next = sortedByDue(next)
    if (sort === 'priority') {
      const rank = { High: 0, Medium: 1, Low: 2 }
      next = [...next].sort((a, b) => rank[a.priority] - rank[b.priority])
    }
    return highlightedTask ? [...next].sort((task) => (task.id === highlightedTask ? -1 : 0)) : next
  }, [tasks, search, filters, sort, highlightedTask])

  useEffect(() => {
    onRefresh()
  }, [onRefresh])

  return (
    <div className="page-grid">
      <section className="page-hero">
        <div>
          <p className="eyebrow">My Activities</p>
          <h1>Plan, edit, and finish your tasks.</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask()}>
          <Plus size={18} />
          Add Task
        </button>
      </section>
      {isLoading && <div className="app-message">Loading tasks...</div>}
      {error && <div className="app-message error-message">{error}</div>}

      <section className="panel controls-panel">
        <label className="search-box">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" />
        </label>
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        >
          {['All', ...statusOptions, 'Overdue'].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
        >
          {['All', ...priorityOptions].map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
        >
          {['All', ...categoryOptions].map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="due-asc">Due soonest</option>
          <option value="due-desc">Due latest</option>
          <option value="priority">Priority</option>
        </select>
      </section>

      <section className="panel">
        <TaskList
          tasks={visibleTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          emptyText="No tasks match your current view."
        />
      </section>
    </div>
  )
}

export default MyActivities
