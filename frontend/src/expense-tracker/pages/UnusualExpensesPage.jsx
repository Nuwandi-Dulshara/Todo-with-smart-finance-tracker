import { useEffect, useState } from 'react'
import AnomalyBadge from '../components/AnomalyBadge'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { expenseApi } from '../services/expenseApi'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

function UnusualExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    expenseApi.getUnusualExpenses()
      .then((data) => {
        if (isMounted) setExpenses(data)
      })
      .catch(() => {
        if (isMounted) setError('Could not load unusual expenses.')
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
          <p className="expense-eyebrow">Unusual Expense Detection</p>
          <h2>Unusual Expenses</h2>
          <p>Review expenses that differ from your normal spending pattern.</p>
        </div>
      </section>
      {isLoading && <LoadingState message="Loading unusual expenses..." />}
      {error && <div className="expense-error">{error}</div>}
      {!isLoading && !error && expenses.length === 0 && (
        <EmptyState title="No unusual expenses detected." message="Your recent transactions look consistent with normal spending patterns." />
      )}
      {!isLoading && !error && expenses.length > 0 && (
        <section className="expense-panel">
          <div className="expense-table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Anomaly Score</th>
                  <th>Status</th>
                  <th>Explanation</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td data-label="Date">{formatDate(expense.date)}</td>
                    <td data-label="Description">{expense.description}</td>
                    <td data-label="Category">{expense.category}</td>
                    <td data-label="Amount" className="expense-amount">{formatCurrency(expense.amount)}</td>
                    <td data-label="Anomaly Score">{expense.anomalyScore}</td>
                    <td data-label="Status"><AnomalyBadge status={expense.anomalyStatus} /></td>
                    <td data-label="Explanation">{expense.anomalyExplanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default UnusualExpensesPage
