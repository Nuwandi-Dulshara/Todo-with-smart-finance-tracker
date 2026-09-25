import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExpenseForm from '../components/ExpenseForm'
import { expenseApi } from '../services/expenseApi'

function AddExpensePage() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const saveExpense = async (expense) => {
    setIsSaving(true)
    setError('')
    try {
      await expenseApi.createExpense(expense)
      navigate('/expense-tracker/expenses', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Could not save this expense.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Add Expense</p>
          <h2>Add Expense</h2>
          <p>Record spending and optionally request an AI category suggestion.</p>
        </div>
      </section>
      {error && <div className="expense-error">{error}</div>}
      <section className="expense-panel narrow">
        <ExpenseForm
          isSaving={isSaving}
          onCancel={() => navigate('/expense-tracker/expenses')}
          onSave={saveExpense}
          onSuggestCategory={expenseApi.predictExpenseCategory}
        />
      </section>
    </div>
  )
}

export default AddExpensePage
