import { ANOMALY_OPTIONS, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/expenseConstants'

function ExpenseFilters({ filters, onChange, onApply, onReset }) {
  const updateFilter = (field, value) => onChange({ ...filters, [field]: value })

  return (
    <form className="expense-filters" onSubmit={(event) => { event.preventDefault(); onApply() }}>
      <label>
        Search
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Search description"
        />
      </label>
      <label>
        Category
        <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
      </label>
      <label>
        Payment
        <select value={filters.paymentMethod} onChange={(event) => updateFilter('paymentMethod', event.target.value)}>
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
        </select>
      </label>
      <label>
        From
        <input type="date" value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} />
      </label>
      <label>
        Min Amount
        <input type="number" min="0" value={filters.minAmount} onChange={(event) => updateFilter('minAmount', event.target.value)} />
      </label>
      <label>
        Max Amount
        <input type="number" min="0" value={filters.maxAmount} onChange={(event) => updateFilter('maxAmount', event.target.value)} />
      </label>
      <label>
        Anomaly
        <select value={filters.anomalyStatus} onChange={(event) => updateFilter('anomalyStatus', event.target.value)}>
          {ANOMALY_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <div className="expense-filter-actions">
        <button className="expense-primary-button" type="submit">Apply Filters</button>
        <button className="expense-secondary-button" type="button" onClick={onReset}>Reset</button>
      </div>
    </form>
  )
}

export default ExpenseFilters
