import EmptyState from './EmptyState'
import LoadingState from './LoadingState'

function ChartCard({ title, imageUrl, loading, error, children }) {
  return (
    <article className="expense-chart-card">
      <div className="expense-card-head">
        <h3>{title}</h3>
      </div>
      {loading && <LoadingState message="Loading chart..." />}
      {!loading && error && <div className="expense-error">{error}</div>}
      {!loading && !error && imageUrl && <img src={imageUrl} alt={`${title} chart`} />}
      {!loading && !error && !imageUrl && (children || <EmptyState title="Chart pending" message="Backend chart image will appear here." />)}
    </article>
  )
}

export default ChartCard
