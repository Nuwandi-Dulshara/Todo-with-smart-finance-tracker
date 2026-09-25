import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ExpenseHeader from '../components/ExpenseHeader'
import ExpenseSidebar from '../components/ExpenseSidebar'

function ExpenseTrackerLayout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="expense-shell">
      <ExpenseSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="expense-main">
        <ExpenseHeader onMenuClick={() => setIsSidebarOpen(true)} onLogout={onLogout} />
        <main className="expense-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ExpenseTrackerLayout
