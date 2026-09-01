import { useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import InsightCard from '../components/InsightCard'
import LoadingState from '../components/LoadingState'
import { expenseApi } from '../services/expenseApi'

const sections = [
  'Financial Summary',
  'Spending Trends',
  'Budget Alerts',
  'Category Insights',
  'Payment Insights',
  'Unusual Activity',
]

function SmartInsightsPage() {
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    expenseApi.getSmartInsights()
      .then((data) => {
        if (isMounted) setInsights(data)
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Could not load insights. Please try again.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Decision Support</p>
          <h2>Smart Insights</h2>
          <p>Automatically generated observations based on your spending behaviour.</p>
        </div>
      </section>
      {isLoading && <LoadingState message="Loading insights..." />}
      {error && <div className="expense-error">{error}</div>}
      {!isLoading && !error && insights.length === 0 && (
        <EmptyState title="Not enough data for insights yet." message="Add more expenses to receive useful spending insights." />
      )}
      {!isLoading && !error && insights.length > 0 && (
        <>
          <section className="insight-section-grid">
            {sections.map((section) => <div key={section}>{section}</div>)}
          </section>
          <section className="insight-grid">
            {insights.map((insight) => <InsightCard key={insight.title} insight={insight} />)}
          </section>
        </>
      )}
    </div>
  )
}

export default SmartInsightsPage
