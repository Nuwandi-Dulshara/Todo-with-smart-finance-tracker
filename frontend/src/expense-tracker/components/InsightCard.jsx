function InsightCard({ insight }) {
  return (
    <article className={`insight-card insight-${insight.type || 'information'}`}>
      <div>
        <p>{insight.period}</p>
        <h3>{insight.title}</h3>
      </div>
      <strong>{insight.metric}</strong>
      <span>{insight.message}</span>
    </article>
  )
}

export default InsightCard
