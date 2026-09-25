function ProgressBar({ value, label }) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="progress-wrap" aria-label={label}>
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{Math.round(safeValue)}%</strong>
      </div>
      <div className="progress-track">
        <span className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
