import { Download, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import ExpenseFilters from '../components/ExpenseFilters'
import ExpenseTable from '../components/ExpenseTable'
import LoadingState from '../components/LoadingState'
import { expenseApi } from '../services/expenseApi'

const defaultFilters = {
  search: '',
  category: '',
  dateFrom: '',
  dateTo: '',
  paymentMethod: '',
  minAmount: '',
  maxAmount: '',
  anomalyStatus: '',
}

function ExpensesPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  const loadExpenses = useCallback(() => {
    setIsLoading(true)
    setError('')
    expenseApi.getExpenses(appliedFilters)
      .then(setExpenses)
      .catch(() => setError('Could not load expenses. Please try again.'))
      .finally(() => setIsLoading(false))
  }, [appliedFilters])

  useEffect(() => {
    Promise.resolve().then(loadExpenses)
  }, [loadExpenses])

  const resetFilters = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const deleteExpense = async () => {
    if (!deleteCandidate) return
    setIsDeleting(true)
    setError('')
    setNotice('')
    try {
      await expenseApi.deleteExpense(deleteCandidate.id)
      setNotice('Expense deleted successfully.')
      setDeleteCandidate(null)
      loadExpenses()
    } catch {
      setError('Could not delete this expense.')
    } finally {
      setIsDeleting(false)
    }
  }

  const downloadCsv = async () => {
    setError('')
    try {
      await expenseApi.downloadExpensesCsv(appliedFilters)
    } catch {
      setError('CSV download failed.')
    }
  }

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Expenses</p>
          <h2>Manage expenses</h2>
          <p>Manage, search, filter, edit, and export your expenses.</p>
        </div>
        <div className="expense-actions">
          <Link className="expense-primary-button" to="/expense-tracker/expenses/add">
            <Plus size={18} />
            Add Expense
          </Link>
          <button className="expense-secondary-button" type="button" onClick={downloadCsv}>
            <Download size={17} />
            Download CSV
          </button>
        </div>
      </section>

      <section className="expense-panel">
        <ExpenseFilters
          filters={filters}
          onChange={setFilters}
          onApply={() => setAppliedFilters(filters)}
          onReset={resetFilters}
        />
      </section>

      {notice && <div className="expense-success">{notice}</div>}
      {error && <div className="expense-error">{error}</div>}
      {isLoading ? (
        <LoadingState message="Loading expenses..." />
      ) : (
        <section className="expense-panel">
          <ExpenseTable expenses={expenses} onDelete={setDeleteCandidate} />
        </section>
      )}

      {deleteCandidate && (
        <ConfirmModal
          title="Delete Expense?"
          message={`Are you sure you want to delete "${deleteCandidate.description}"?`}
          confirmLabel="Delete Expense"
          isBusy={isDeleting}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={deleteExpense}
        />
      )}
    </div>
  )
}

export default ExpensesPage
