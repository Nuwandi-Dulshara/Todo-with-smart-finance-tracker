function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <article className="expense-stat-card">
      {Icon && (
        <span className="expense-stat-icon">
          <Icon size={22} />
        </span>
      )}
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
    </article>
  )
}

export default StatCard
