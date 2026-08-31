import { X } from 'lucide-react'
import { useState } from 'react'
import { categoryOptions, priorityOptions, statusOptions, todayInput } from '../../utils/taskHelpers'

function TaskForm({ task, defaultDate, isSaving = false, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: task?.id || '',
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || defaultDate || todayInput(),
    dueTime: task?.dueTime || '09:00',
    priority: task?.priority || 'Medium',
    category: task?.category || 'Work',
    status: task?.status === 'Overdue' ? 'To Do' : task?.status || 'To Do',
    estimatedMinutes: task?.estimatedMinutes ?? '',
    createdAt: task?.createdAt || new Date().toISOString(),
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim() })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="modal-head">
          <h2 id="task-form-title">{task ? 'Edit Task' : 'Add Task'}</h2>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close task form">
            <X size={18} />
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Task Name
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Enter task name"
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Add useful task details"
              rows="4"
            />
          </label>
          <div className="form-grid">
            <label>
              Due Date
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField('dueDate', event.target.value)}
              />
            </label>
            <label>
              Due Time
              <input
                type="time"
                value={form.dueTime}
                onChange={(event) => updateField('dueTime', event.target.value)}
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Priority
              <select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                {priorityOptions.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Status
            <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Estimated Minutes
            <input
              type="number"
              min="0"
              value={form.estimatedMinutes}
              onChange={(event) => updateField('estimatedMinutes', event.target.value)}
              placeholder="Optional"
            />
          </label>
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskForm
