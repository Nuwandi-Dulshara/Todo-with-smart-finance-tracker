function ConfirmModal({ title, message, confirmLabel = 'Confirm', isBusy, onCancel, onConfirm }) {
  return (
    <div className="expense-modal-backdrop">
      <section className="expense-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="expense-confirm-title">
        <h2 id="expense-confirm-title">{title}</h2>
        <p>{message}</p>
        <p>This action cannot be undone.</p>
        <div className="expense-modal-actions">
          <button className="expense-secondary-button" type="button" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
          <button className="expense-danger-button" type="button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmModal
