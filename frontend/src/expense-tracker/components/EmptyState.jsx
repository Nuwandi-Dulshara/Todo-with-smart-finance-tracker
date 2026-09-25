function EmptyState({ title, message, action }) {
  return (
    <div className="expense-empty-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

export default EmptyState
