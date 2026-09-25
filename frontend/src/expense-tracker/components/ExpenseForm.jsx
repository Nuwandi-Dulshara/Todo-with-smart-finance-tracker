import { Brain } from 'lucide-react'
import { useState } from 'react'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/expenseConstants'
import { todayIsoDate } from '../utils/date'

const initialForm = {
  date: todayIsoDate(),
  description: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'Cash',
  notes: '',
  predictedCategory: '',
  predictionConfidence: 0,
}

function ExpenseForm({ initialExpense, isSaving, onCancel, onSave, onSuggestCategory }) {
  const [form, setForm] = useState({ ...initialForm, ...initialExpense })
  const [errors, setErrors] = useState({})
  const [predictionError, setPredictionError] = useState('')
  const [isPredicting, setIsPredicting] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setPredictionError('')
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.date) nextErrors.date = 'Date is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    else if (form.description.trim().length < 2) nextErrors.description = 'Description must be at least 2 characters.'
    if (!form.amount) nextErrors.amount = 'Amount is required.'
    else if (Number(form.amount) <= 0) nextErrors.amount = 'Amount must be greater than 0.'
    if (!form.category) nextErrors.category = 'Category is required.'
    if (!form.paymentMethod) nextErrors.paymentMethod = 'Payment method is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSuggestCategory = async () => {
    if (form.description.trim().length < 2) {
      setPredictionError('Enter a description before requesting a suggestion.')
      return
    }

    setIsPredicting(true)
    setPredictionError('')
    try {
      const suggestion = await onSuggestCategory(form.description)
      setForm((current) => ({
        ...current,
        predictedCategory: suggestion.predictedCategory,
        predictionConfidence: suggestion.confidence,
      }))
    } catch (requestError) {
      setPredictionError(requestError.message || 'Category prediction is temporarily unavailable.')
    } finally {
      setIsPredicting(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      description: form.description.trim(),
      amount: Number(form.amount),
      predictedCategory: form.predictedCategory || form.category,
    })
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form-grid">
        <label>
          Date
          <input type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
          {errors.date && <small>{errors.date}</small>}
        </label>
        <label>
          Amount
          <input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => updateField('amount', event.target.value)} />
          {errors.amount && <small>{errors.amount}</small>}
        </label>
      </div>
      <label>
        Description
        <input
          type="text"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Uber to office"
        />
        {errors.description && <small>{errors.description}</small>}
      </label>
      <div className="prediction-panel">
        <button className="expense-secondary-button" type="button" onClick={handleSuggestCategory} disabled={isPredicting}>
          <Brain size={17} />
          {isPredicting ? 'Suggesting...' : 'Suggest Category'}
        </button>
        {form.predictedCategory && (
          <div>
            <p>Suggested Category: <strong>{form.predictedCategory}</strong></p>
            <span>AI confidence: {Math.round(form.predictionConfidence * 100)}%</span>
            <button className="text-button" type="button" onClick={() => updateField('category', form.predictedCategory)}>
              Accept suggestion
            </button>
          </div>
        )}
        {predictionError && <small>{predictionError}</small>}
      </div>
      <div className="expense-form-grid">
        <label>
          Category
          <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
            {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
          {errors.category && <small>{errors.category}</small>}
        </label>
        <label>
          Payment Method
          <select value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)}>
            {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
          </select>
          {errors.paymentMethod && <small>{errors.paymentMethod}</small>}
        </label>
      </div>
      <label>
        Notes
        <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Optional notes" />
      </label>
      <div className="expense-form-actions">
        <button className="expense-secondary-button" type="button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
        <button className="expense-primary-button" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
