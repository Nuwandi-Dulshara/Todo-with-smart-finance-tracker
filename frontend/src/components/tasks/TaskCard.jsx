import { Calendar, Check, Clock, Pencil, Trash2 } from 'lucide-react'
import { getPriorityClass, getStatusClass, readableDate } from '../../utils/taskHelpers'

function TaskCard({ task, compact = false, onEdit, onDelete, onUpdate }) {
  const isCompleted = task.status === 'Completed'

  return (
    <article className={`task-card ${compact ? 'compact' : ''} ${isCompleted ? 'done' : ''}`}>
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
        {!compact && <p>{task.description}</p>}
        <div className="task-meta">
          <span>
            <Calendar size={14} />
            {readableDate(task.dueDate)}
          </span>
          <span>
            <Clock size={14} />
            {task.dueTime}
          </span>
          <span className={`pill status-pill ${getStatusClass(task.status)}`}>{task.status}</span>
          {!compact && <span className="category-pill">{task.category}</span>}
        </div>
      </div>
      {!compact && (
        <div className="task-actions">
          <button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label="Edit task">
            <Pencil size={17} />
          </button>
          <button
            className="icon-button danger"
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            <Trash2 size={17} />
          </button>
        </div>
      )}
    </article>
  )
}

export default TaskCard
