import {
  Brain,
  LayoutDashboard,
  ListTodo,
  Plus,
  ReceiptText,
  ShieldAlert,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/expense-tracker/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', path: '/expense-tracker/expenses', icon: ReceiptText },
  { label: 'Add Expense', path: '/expense-tracker/expenses/add', icon: Plus },
  { label: 'Budgets', path: '/expense-tracker/budgets', icon: WalletCards },
  { label: 'Smart Insights', path: '/expense-tracker/insights', icon: Brain },
  { label: 'Unusual Expenses', path: '/expense-tracker/unusual-expenses', icon: ShieldAlert },
  { label: 'Back to Task Manager', path: '/', icon: ListTodo },
]

function ExpenseSidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className={`expense-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="expense-sidebar-brand">
          <img src="/logo/logo.png" alt="Organix AI" />
          <span>Expense Tracker</span>
        </div>
        <nav className="expense-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/expense-tracker/dashboard' || item.path === '/'}
              className={({ isActive }) => `expense-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {isOpen && <button className="expense-scrim" type="button" aria-label="Close menu" onClick={onClose} />}
    </>
  )
}

export default ExpenseSidebar
