import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import TaskList from '../components/tasks/TaskList'
import TaskToolbar from '../components/tasks/TaskToolbar'
import { api } from '../services/api'
import { formatDateInput, readableDate, todayInput } from '../utils/taskHelpers'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const sortOptions = [
  { label: 'Due date', value: 'dueDate' },
  { label: 'Due time', value: 'dueTime' },
  { label: 'Priority', value: 'priority' },
]

function Calendar({ tasks, refreshKey, onEditTask, onDeleteTask, onUpdateTask }) {
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(todayInput())
  const [monthTasks, setMonthTasks] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
    sort: 'dueDate',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const calendarDays = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - firstDay.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [cursor])

  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(cursor)
  const sourceMonthTasks = monthTasks ?? tasks
  const sourceSelectedTasks = selectedTasks ?? tasks.filter((task) => task.dueDate === selectedDate)
  const categories = useMemo(
    () => [...new Set(sourceMonthTasks.map((task) => task.category).filter(Boolean))].sort(),
    [sourceMonthTasks],
  )

  const applyFilters = (taskList) => {
    const query = search.trim().toLowerCase()
    const filtered = taskList.filter((task) => {
      const term = `${task.title} ${task.description} ${task.category}`.toLowerCase()
      return (
        (!query || term.includes(query)) &&
        (filters.status === 'All' || task.status === filters.status) &&
        (filters.priority === 'All' || task.priority === filters.priority) &&
        (filters.category === 'All' || task.category === filters.category)
      )
    })

    if (filters.sort === 'priority') {
      const rank = { High: 0, Medium: 1, Low: 2 }
      return [...filtered].sort((a, b) => rank[a.priority] - rank[b.priority])
    }
    if (filters.sort === 'dueTime') {
      return [...filtered].sort((a, b) => (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99'))
    }
    return [...filtered].sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`))
  }

  const visibleMonthTasks = applyFilters(sourceMonthTasks)
  const visibleSelectedTasks = applyFilters(sourceSelectedTasks)

  const changeMonth = (amount) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const changeFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  useEffect(() => {
    let isMounted = true
    Promise.resolve()
      .then(() => {
        if (!isMounted) return null
        setIsLoading(true)
        setError('')
        return api.getCalendar(cursor.getMonth() + 1, cursor.getFullYear())
      })
      .then((data) => {
        if (isMounted && data) setMonthTasks(data.tasks)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to load calendar tasks. Please try again.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [cursor, refreshKey])

  useEffect(() => {
    let isMounted = true
    api
      .getCalendarDate(selectedDate)
      .then((dateTasks) => {
        if (isMounted) setSelectedTasks(dateTasks)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to load selected date tasks. Please try again.')
      })
    return () => {
      isMounted = false
    }
  }, [selectedDate, refreshKey])

  return (
    <div className="page-grid">
      <section className="page-hero elevated-hero">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>See task timing at a glance.</h1>
          <p className="hero-subtitle">Browse scheduled work by month and selected date.</p>
        </div>
      </section>

      {isLoading && <div className="app-message">Loading calendar tasks...</div>}
      {error && <div className="app-message error-message">{error}</div>}

      <TaskToolbar
        search={search}
        placeholder="Search calendar tasks..."
        filters={filters}
        categories={categories}
        sortOptions={sortOptions}
        onSearchChange={setSearch}
        onFilterChange={changeFilter}
        onSortChange={(value) => changeFilter('sort', value)}
      />

      <section className="calendar-layout">
        <div className="panel calendar-panel">
          <div className="calendar-toolbar">
            <button className="icon-button" type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <h2>{monthLabel}</h2>
            <button className="icon-button" type="button" onClick={() => changeMonth(1)} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="calendar-grid">
            {weekDays.map((day) => (
              <span className="weekday" key={day}>
                {day}
              </span>
            ))}
            {calendarDays.map((date) => {
              const dateInput = formatDateInput(date)
              const dayTasks = visibleMonthTasks.filter((task) => task.dueDate === dateInput)
              const isCurrentMonth = date.getMonth() === cursor.getMonth()
              return (
                <button
                  className={`calendar-day ${dateInput === todayInput() ? 'today' : ''} ${
                    dateInput === selectedDate ? 'selected' : ''
                  } ${!isCurrentMonth ? 'muted' : ''}`}
                  key={dateInput}
                  type="button"
                  onClick={() => setSelectedDate(dateInput)}
                >
                  <span>{date.getDate()}</span>
                  <div className="calendar-dots">
                    {dayTasks.slice(0, 3).map((task) => (
                      <i
                        key={task.id}
                        className={`dot ${task.status === 'Completed' ? 'done' : task.status === 'Overdue' ? 'late' : ''}`}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Selected Date</p>
              <h2>{readableDate(selectedDate)}</h2>
            </div>
          </div>
          <TaskList
            tasks={visibleSelectedTasks}
            compact
            showActions
            showDescription
            allowStatusChange
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            emptyText="No calendar tasks found for this date."
          />
        </div>
      </section>
    </div>
  )
}

export default Calendar
