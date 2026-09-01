import { formatCurrency } from '../utils/currency'
import { getBudgetStatus } from '../utils/budget'

function BudgetProgress({ budget }) {
  const remaining = budget.amount - budget.spent
  const usedPercentage = budget.amount ? (budget.spent / budget.amount) * 100 : 0
  const status = getBudgetStatus(usedPercentage)

  return (
    <article className={`budget-progress status-${status.toLowerCase()}`}>
      <div className="budget-progress-head">
        <div>
          <p>{budget.category}</p>
          <strong>{formatCurrency(budget.amount)}</strong>
        </div>
        <span>{status} - {Math.round(usedPercentage)}% used</span>
      </div>
      <div className="budget-meter" aria-label={`${status} - ${Math.round(usedPercentage)}% used`}>
        <span style={{ width: `${Math.min(usedPercentage, 100)}%` }} />
      </div>
      <div className="budget-progress-meta">
        <span>Spent {formatCurrency(budget.spent)}</span>
        <span>Remaining {formatCurrency(remaining)}</span>
      </div>
    </article>
  )
}

export default BudgetProgress
