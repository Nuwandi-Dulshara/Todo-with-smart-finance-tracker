function EmptyPage({ onLogout }) {
  return (
    <main className="expense-empty-page" aria-label="Expense Tracker Dashboard">
      <button className="signup-button expense-logout-button" type="button" onClick={onLogout}>
        Log Out
      </button>
    </main>
  )
}

export default EmptyPage
