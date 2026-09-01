import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExpenseForm from '../components/ExpenseForm'
import LoadingState from '../components/LoadingState'
import { expenseApi } from '../services/expenseApi'

function EditExpensePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    expenseApi.getExpenseById(id)
      .then((data) => {
        if (!isMounted) return
        if (!data) setError('Expense not found.')
        setExpense(data)
      })
      .catch(() => {
        if (isMounted) setError('Could not load this expense.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id])

  const updateExpense = async (payload) => {
    setIsSaving(true)
    setError('')
    try {
      await expenseApi.updateExpense(id, payload)
      navigate('/expense-tracker/expenses', { replace: true })
    } catch {
      setError('Could not update this expense.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Edit Expense</p>
          <h2>Edit Expense</h2>
          <p>Update transaction details and keep analytics clean.</p>
        </div>
      </section>
      {error && <div className="expense-error">{error}</div>}
      {isLoading && <LoadingState message="Loading expense..." />}
      {!isLoading && expense && (
        <section className="expense-panel narrow">
          <ExpenseForm
            initialExpense={expense}
            isSaving={isSaving}
            onCancel={() => navigate('/expense-tracker/expenses')}
            onSave={updateExpense}
            onSuggestCategory={expenseApi.predictExpenseCategory}
          />
        </section>
      )}
    </div>
  )
}

export default EditExpensePage
