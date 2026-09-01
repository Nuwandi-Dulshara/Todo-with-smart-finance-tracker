import { Edit3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import AnomalyBadge from './AnomalyBadge'
import CategoryBadge from './CategoryBadge'
import EmptyState from './EmptyState'

function ExpenseTable({ expenses, compact = false, onDelete }) {
  if (!expenses.length) {
    return (
      <EmptyState
        title="No expenses found."
        message="Try changing your filters or add a new expense."
      />
    )
  }

  return (
    <div className="expense-table-wrap">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Payment Method</th>
            {!compact && <th>Predicted Category</th>}
            <th>Anomaly</th>
            {!compact && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td data-label="Date">{formatDate(expense.date)}</td>
              <td data-label="Description">
                <strong>{expense.description}</strong>
                {expense.notes && <span>{expense.notes}</span>}
              </td>
              <td data-label="Amount" className="expense-amount">{formatCurrency(expense.amount)}</td>
              <td data-label="Category"><CategoryBadge category={expense.category} /></td>
              <td data-label="Payment Method">{expense.paymentMethod}</td>
              {!compact && (
                <td data-label="Predicted Category">
                  {expense.predictedCategory} ({Math.round((expense.predictionConfidence || 0) * 100)}%)
                </td>
              )}
              <td data-label="Anomaly"><AnomalyBadge status={expense.anomalyStatus} /></td>
              {!compact && (
                <td data-label="Actions">
                  <div className="expense-row-actions">
                    <Link className="expense-icon-button" to={`/expense-tracker/expenses/${expense.id}/edit`} aria-label={`Edit ${expense.description}`}>
                      <Edit3 size={17} />
                    </Link>
                    <button className="expense-icon-button danger" type="button" onClick={() => onDelete(expense)} aria-label={`Delete ${expense.description}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseTable
