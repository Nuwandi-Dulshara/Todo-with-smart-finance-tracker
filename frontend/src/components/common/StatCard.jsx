function StatCard({ icon: Icon, label, value, tone = 'yellow' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-icon">{Icon && <Icon size={22} />}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

export default StatCard
