import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import BudgetProgress from '../components/BudgetProgress'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { expenseApi } from '../services/expenseApi'
import { getBudgetStatus } from '../utils/budget'
import { formatCurrency } from '../utils/currency'
import { EXPENSE_CATEGORIES } from '../utils/expenseConstants'

function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [form, setForm] = useState({ category: 'Food', amount: '' })
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadBudgets = useCallback(() => {
    setIsLoading(true)
    expenseApi.getBudgets()
      .then(setBudgets)
      .catch((requestError) => setError(requestError.message || 'Could not load budgets. Please try again.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadBudgets)
  }, [loadBudgets])

  const startEdit = (budget) => {
    setEditingId(budget.id)
    setForm({ category: budget.category, amount: String(budget.amount) })
    setError('')
    setNotice('')
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ category: 'Food', amount: '' })
  }

  const saveBudget = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!form.category || Number(form.amount) <= 0) {
      setError('Category and a budget amount greater than 0 are required.')
      return
    }
    const duplicate = budgets.find((budget) => budget.category === form.category && budget.id !== editingId)
    if (duplicate) {
      setError('A budget for this category already exists.')
      return
    }

    setIsSaving(true)
    try {
      if (editingId) await expenseApi.updateBudget(editingId, form)
      else await expenseApi.createBudget(form)
      setNotice('Budget saved successfully.')
      resetForm()
      loadBudgets()
    } catch (requestError) {
      setError(requestError.message || 'Could not save budget.')
    } finally {
      setIsSaving(false)
    }
  }

  const overall = budgets.find((budget) => budget.category === 'Overall') || budgets[0]

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Budget Management</p>
          <h2>Budgets</h2>
          <p>Track overall monthly budget and category-specific limits.</p>
        </div>
      </section>

      {notice && <div className="expense-success">{notice}</div>}
      {error && <div className="expense-error">{error}</div>}
      {isLoading && <LoadingState message="Loading budgets..." />}

      {!isLoading && budgets.length === 0 && (
        <EmptyState title="No budgets configured." message="Create a monthly or category budget to start tracking spending limits." />
      )}

      {!isLoading && budgets.length > 0 && (
        <>
          {overall && <BudgetProgress budget={overall} />}
          <section className="expense-panel">
            <div className="expense-section-head">
              <div>
                <p className="expense-eyebrow">Category Budgets</p>
                <h3>Monthly limits by category</h3>
              </div>
              <button className="expense-secondary-button" type="button" onClick={resetForm}>
                <Plus size={16} />
                Add Category Budget
              </button>
            </div>
            <div className="expense-table-wrap">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Used</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.filter((budget) => budget.category !== 'Overall').map((budget) => {
                    const used = budget.amount ? (budget.spent / budget.amount) * 100 : 0
                    const status = getBudgetStatus(used)
                    return (
                      <tr key={budget.id}>
                        <td data-label="Category">{budget.category}</td>
                        <td data-label="Budget">{formatCurrency(budget.amount)}</td>
                        <td data-label="Spent">{formatCurrency(budget.spent)}</td>
                        <td data-label="Remaining">{formatCurrency(budget.amount - budget.spent)}</td>
                        <td data-label="Used">{used.toFixed(1)}%</td>
                        <td data-label="Status">{status}</td>
                        <td data-label="Action">
                          <button className="expense-secondary-button compact" type="button" onClick={() => startEdit(budget)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="expense-panel narrow">
        <div className="expense-section-head">
          <div>
            <p className="expense-eyebrow">{editingId ? 'Edit Budget' : 'Budget Form'}</p>
            <h3>{editingId ? 'Update category limit' : 'Create category limit'}</h3>
          </div>
        </div>
        <form className="expense-form" onSubmit={saveBudget}>
          <label>
            Category
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Monthly Budget
            <input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          </label>
          <div className="expense-form-actions">
            <button className="expense-secondary-button" type="button" onClick={resetForm} disabled={isSaving}>Cancel</button>
            <button className="expense-primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Budget'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BudgetsPage
