import { Pencil, Trash2 } from 'lucide-react'
import { getPriorityClass, getStatusClass, readableDate } from '../../utils/taskHelpers'

function TaskTable({ tasks, emptyText = 'No tasks found.', onEdit, onDelete, onUpdate }) {
  if (tasks.length === 0) {
    return <div className="empty-state">{emptyText}</div>
  }

  return (
    <div className="task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Due Time</th>
            <th>Priority</th>
            <th>Category</th>
            <th>Status</th>
            <th>Estimated Minutes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusValue = task.status === 'Overdue' ? 'To Do' : task.status

            return (
              <tr key={task.id} className={task.status === 'Completed' ? 'is-completed' : ''}>
                <td data-label="Task Name">
                  <strong className="table-task-title">{task.title}</strong>
                </td>
                <td data-label="Description" className="table-description">{task.description || 'No description'}</td>
                <td data-label="Due Date">{readableDate(task.dueDate)}</td>
                <td data-label="Due Time">{task.dueTime || 'No time'}</td>
                <td data-label="Priority">
                  <span className={`pill ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                </td>
                <td data-label="Category">{task.category || 'General'}</td>
                <td data-label="Status">
                  <select
                    className={`task-status-select table-status ${getStatusClass(task.status)}`}
                    value={statusValue}
                    onChange={(event) => onUpdate(task.id, { status: event.target.value })}
                    aria-label={`Change status for ${task.title}`}
                  >
                    <option value="To Do">Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td data-label="Estimated Minutes">{task.estimatedMinutes ? `${task.estimatedMinutes} min` : 'No estimate'}</td>
                <td data-label="Actions">
                  <div className="table-actions">
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TaskTable
