import { AlertTriangle } from 'lucide-react'

function DeleteTaskDialog({ task, isDeleting, onCancel, onConfirm }) {
  if (!task) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-task-title">
        <span className="delete-icon">
          <AlertTriangle size={22} />
        </span>
        <h2 id="delete-task-title">Delete task?</h2>
        <p>Are you sure you want to delete this task?</p>
        <div className="form-actions">
          <button className="danger-button" type="button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeleteTaskDialog
