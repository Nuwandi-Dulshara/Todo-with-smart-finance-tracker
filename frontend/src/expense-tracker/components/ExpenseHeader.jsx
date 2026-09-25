import { LogOut, Menu } from 'lucide-react'

function ExpenseHeader({ onMenuClick, onLogout }) {
  return (
    <header className="expense-header">
      <button className="expense-icon-button mobile-only" type="button" aria-label="Open menu" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div>
        <p className="expense-eyebrow">Organix AI</p>
        <h1>Expense Tracker</h1>
      </div>
      <button className="expense-primary-button" type="button" onClick={onLogout}>
        <LogOut size={17} />
        Log Out
      </button>
    </header>
  )
}

export default ExpenseHeader
