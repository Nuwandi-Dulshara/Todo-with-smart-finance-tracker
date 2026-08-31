import { Calendar, Check, Clock, Pencil, Trash2 } from 'lucide-react'
import { getPriorityClass, getStatusClass, readableDate } from '../../utils/taskHelpers'

function TaskCard({
  task,
  compact = false,
  showActions,
  showDescription,
  allowStatusChange = false,
  onEdit,
  onDelete,
  onUpdate,
}) {
  const isCompleted = task.status === 'Completed'
  const shouldShowActions = showActions ?? !compact
  const shouldShowDescription = showDescription ?? !compact

  return (
    <article
      className={`task-card ${compact ? 'compact' : ''} ${shouldShowActions ? 'with-actions' : ''} ${
        isCompleted ? 'done' : ''
      } ${task.status === 'Overdue' ? 'late' : ''}`}
    >
      <label className="task-check">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={(event) =>
            onUpdate(task.id, { status: event.target.checked ? 'Completed' : 'To Do' })
          }
        />
        <span>{isCompleted && <Check size={14} />}</span>
      </label>
      <div className="task-body">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <span className={`pill ${getPriorityClass(task.priority)}`}>{task.priority}</span>
        </div>
        {shouldShowDescription && task.description && <p>{task.description}</p>}
        {compact ? (
          <div className="task-meta">
            <span>
              <Calendar size={14} />
              {readableDate(task.dueDate)}
            </span>
            <span>
              <Clock size={14} />
              {task.dueTime || 'No time'}
            </span>
            <span className={`pill status-pill ${getStatusClass(task.status)}`}>{task.status}</span>
          </div>
        ) : (
          <div className="task-detail-grid">
            <span>
              <strong>Due Date</strong>
              {readableDate(task.dueDate)}
            </span>
            <span>
              <strong>Due Time</strong>
              {task.dueTime || 'No time'}
            </span>
            <span>
              <strong>Category</strong>
              {task.category}
            </span>
            <span>
              <strong>Status</strong>
              <i className={`pill status-pill ${getStatusClass(task.status)}`}>{task.status}</i>
            </span>
            <span>
              <strong>Estimated Minutes</strong>
              {task.estimatedMinutes ? `${task.estimatedMinutes} min` : 'No estimate'}
            </span>
          </div>
        )}
      </div>
      {shouldShowActions && (
        <div className="task-actions">
          {allowStatusChange && (
            <select
              className="task-status-select"
              value={isCompleted ? 'Completed' : task.status === 'Overdue' ? 'To Do' : task.status}
              onChange={(event) => onUpdate(task.id, { status: event.target.value })}
              aria-label={`Change status for ${task.title}`}
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          )}
          <button
            className="icon-button task-edit-button"
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
          >
            <Pencil size={17} />
          </button>
          <button
            className="icon-button danger task-delete-button"
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <Trash2 size={17} />
          </button>
        </div>
      )}
    </article>
  )
}

export default TaskCard
