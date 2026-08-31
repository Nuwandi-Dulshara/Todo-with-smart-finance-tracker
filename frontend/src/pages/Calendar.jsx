import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import TaskList from '../components/tasks/TaskList'
import { api } from '../services/api'
import { formatDateInput, readableDate, todayInput } from '../utils/taskHelpers'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Calendar({ tasks, refreshKey, onAddTask, onEditTask, onDeleteTask, onUpdateTask }) {
  const [cursor, setCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(todayInput())
  const [monthTasks, setMonthTasks] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState(null)
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
  const visibleMonthTasks = monthTasks ?? tasks
  const visibleSelectedTasks = selectedTasks ?? tasks.filter((task) => task.dueDate === selectedDate)

  const changeMonth = (amount) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
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
        if (isMounted) setError(requestError.message || 'Unable to connect to TaskFlow server.')
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
        if (isMounted) setError(requestError.message || 'Unable to connect to TaskFlow server.')
      })
    return () => {
      isMounted = false
    }
  }, [selectedDate, refreshKey])

  return (
    <div className="page-grid">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>See task timing at a glance.</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddTask(selectedDate)}>
          <Plus size={18} />
          Add Task
        </button>
      </section>
      {isLoading && <div className="app-message">Loading calendar tasks...</div>}
      {error && <div className="app-message error-message">{error}</div>}

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
            <button className="secondary-button" type="button" onClick={() => onAddTask(selectedDate)}>
              <Plus size={16} />
              Add
            </button>
          </div>
          <TaskList
            tasks={visibleSelectedTasks}
            compact
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            emptyText="No tasks on this date."
          />
        </div>
      </section>
    </div>
  )
}

export default Calendar
