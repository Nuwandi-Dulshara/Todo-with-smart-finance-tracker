import { ArrowRight, Banknote, CreditCard, Plus, ReceiptText, TrendingUp, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ChartCard from '../components/ChartCard'
import EmptyState from '../components/EmptyState'
import ExpenseTable from '../components/ExpenseTable'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import { expenseApi } from '../services/expenseApi'
import { formatCurrency } from '../utils/currency'

function ExpenseDashboard() {
  const [data, setData] = useState(null)
  const [chartUrls, setChartUrls] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    expenseApi.getDashboardSummary()
      .then((dashboardData) => {
        if (isMounted) setData(dashboardData)
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || 'Could not load dashboard analytics.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const createdUrls = []
    const charts = [
      ['category-bar', 'Category-wise Spending'],
      ['category-pie', 'Expense Category Mix'],
      ['daily-line', 'Daily Spending'],
      ['monthly-trend', 'Monthly Trend'],
      ['payment-method', 'Payment Method Distribution'],
      ['top-expenses', 'Top Five Largest Expenses'],
    ]

    Promise.all(
      charts.map(([name]) =>
        expenseApi.getChartImageUrl(name).then((url) => {
          createdUrls.push(url)
          return [name, url]
        }).catch(() => [name, '']),
      ),
    ).then((entries) => {
      if (isMounted) setChartUrls(Object.fromEntries(entries))
    })

    return () => {
      isMounted = false
      createdUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [])

  const summary = data?.summary

  return (
    <div className="expense-page-grid">
      <section className="expense-page-hero">
        <div>
          <p className="expense-eyebrow">Dashboard</p>
          <h2>Expense Tracker Dashboard</h2>
          <p>Track spending, monitor budgets, and view intelligent financial insights.</p>
        </div>
        <Link className="expense-primary-button" to="/expense-tracker/expenses/add">
          <Plus size={18} />
          Add Expense
        </Link>
      </section>

      {isLoading && <LoadingState message="Loading dashboard data..." />}
      {error && <div className="expense-error">{error}</div>}

      {!isLoading && !error && summary && (
        <>
          <section className="expense-alert-grid">
            {data.alerts.map((alert) => <div className="expense-alert" key={alert}>{alert}</div>)}
          </section>
          <section className="expense-stats-grid">
            <StatCard title="Total Expenses" value={formatCurrency(summary.totalExpenses)} subtitle="All recorded expenses" icon={WalletCards} />
            <StatCard title="Transactions" value={summary.transactionCount} subtitle="Recorded entries" icon={ReceiptText} />
            <StatCard title="Average Transaction" value={formatCurrency(summary.averageTransaction)} subtitle="Across all expenses" icon={Banknote} />
            <StatCard title="Highest Expense" value={formatCurrency(summary.highestExpense)} subtitle="Largest single entry" icon={TrendingUp} />
            <StatCard title="Current Month" value={formatCurrency(summary.currentMonthSpending)} subtitle="This month spending" icon={CreditCard} />
            <StatCard title="Previous Month" value={formatCurrency(summary.previousMonthSpending)} subtitle="Last month spending" icon={CreditCard} />
            <StatCard title="Monthly Change" value={`${summary.percentageChange > 0 ? '+' : ''}${summary.percentageChange}%`} subtitle="Compared with last month" icon={TrendingUp} />
            <StatCard title="Top Category" value={summary.mostUsedCategory} subtitle="Most-used category" icon={ReceiptText} />
          </section>

          <section className="quick-actions">
            <Link to="/expense-tracker/expenses/add">+ Add Expense</Link>
            <Link to="/expense-tracker/expenses">View Expenses</Link>
            <Link to="/expense-tracker/budgets">Set Budget</Link>
            <Link to="/expense-tracker/insights">View Smart Insights</Link>
          </section>

          <section className="expense-charts-grid">
            {[
              ['category-bar', 'Category-wise Spending'],
              ['category-pie', 'Expense Category Mix'],
              ['daily-line', 'Daily Spending'],
              ['monthly-trend', 'Monthly Trend'],
              ['payment-method', 'Payment Method Distribution'],
              ['top-expenses', 'Top Five Largest Expenses'],
            ].map(([name, title]) => (
              <ChartCard title={title} imageUrl={chartUrls[name]} key={name}>
                <div className="chart-placeholder">
                  <span />
                  <p>Matplotlib chart image will appear when backend data is available.</p>
                </div>
              </ChartCard>
            ))}
          </section>

          <section className="expense-panel">
            <div className="expense-section-head">
              <div>
                <p className="expense-eyebrow">Recent Expenses</p>
                <h3>Latest transactions</h3>
              </div>
              <Link className="expense-secondary-button" to="/expense-tracker/expenses">
                View All Expenses <ArrowRight size={16} />
              </Link>
            </div>
            {data.recentExpenses.length ? (
              <ExpenseTable expenses={data.recentExpenses} compact />
            ) : (
              <EmptyState title="No expenses yet." message="Add your first expense to start seeing financial analytics." />
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default ExpenseDashboard
