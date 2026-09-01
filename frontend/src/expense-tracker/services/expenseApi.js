import { EXPENSE_CATEGORIES } from '../utils/expenseConstants'
import { csvDateStamp } from '../utils/date'

const STORAGE_KEY = 'organix-expenses'
const BUDGET_STORAGE_KEY = 'organix-budgets'

const mockExpenses = [
  {
    id: 1,
    date: '2026-07-18',
    description: 'Lunch at restaurant',
    amount: 1250,
    category: 'Food',
    paymentMethod: 'Cash',
    notes: 'Meeting with client',
    predictedCategory: 'Food',
    predictionConfidence: 0.93,
    anomalyStatus: 'normal',
    anomalyScore: 0.12,
    anomalyExplanation: 'This expense is within your usual Food spending range.',
  },
  {
    id: 2,
    date: '2026-07-18',
    description: 'Uber to office',
    amount: 850,
    category: 'Transport',
    paymentMethod: 'Debit Card',
    notes: '',
    predictedCategory: 'Transport',
    predictionConfidence: 0.91,
    anomalyStatus: 'normal',
    anomalyScore: 0.18,
    anomalyExplanation: 'This expense matches your common transport pattern.',
  },
  {
    id: 3,
    date: '2026-07-17',
    description: 'Hotel booking',
    amount: 28000,
    category: 'Housing',
    paymentMethod: 'Credit Card',
    notes: 'Project travel',
    predictedCategory: 'Housing',
    predictionConfidence: 0.78,
    anomalyStatus: 'unusual',
    anomalyScore: -0.72,
    anomalyExplanation: 'This expense is unusual compared with your normal Housing transactions.',
  },
]

const mockBudgets = [
  { id: 1, category: 'Overall', amount: 100000 },
  { id: 2, category: 'Food', amount: 20000 },
  { id: 3, category: 'Transport', amount: 10000 },
  { id: 4, category: 'Entertainment', amount: 5000 },
]

const wait = (value) => new Promise((resolve) => window.setTimeout(() => resolve(value), 220))

const readStored = (key, fallback) => {
  const stored = window.localStorage.getItem(key)
  if (!stored) {
    window.localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }
  return JSON.parse(stored)
}

const writeStored = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
  return value
}

const normalizeExpense = (expense) => ({
  ...expense,
  amount: Number(expense.amount),
  paymentMethod: expense.paymentMethod || expense.payment_method || 'Cash',
  predictedCategory: expense.predictedCategory || expense.predicted_category || expense.category,
  predictionConfidence: Number(expense.predictionConfidence ?? expense.prediction_confidence ?? 0.8),
  anomalyStatus: expense.anomalyStatus || expense.anomaly_status || 'normal',
  anomalyScore: Number(expense.anomalyScore ?? expense.anomaly_score ?? 0.1),
})

const getExpensesFromStorage = () => readStored(STORAGE_KEY, mockExpenses).map(normalizeExpense)

const filterExpenses = (expenses, filters = {}) =>
  expenses.filter((expense) => {
    const search = filters.search?.trim().toLowerCase()
    const matchesSearch = !search || expense.description.toLowerCase().includes(search)
    const matchesCategory = !filters.category || expense.category === filters.category
    const matchesPayment = !filters.paymentMethod || expense.paymentMethod === filters.paymentMethod
    const matchesAnomaly = !filters.anomalyStatus || expense.anomalyStatus === filters.anomalyStatus
    const matchesFrom = !filters.dateFrom || expense.date >= filters.dateFrom
    const matchesTo = !filters.dateTo || expense.date <= filters.dateTo
    const matchesMin = !filters.minAmount || expense.amount >= Number(filters.minAmount)
    const matchesMax = !filters.maxAmount || expense.amount <= Number(filters.maxAmount)

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPayment &&
      matchesAnomaly &&
      matchesFrom &&
      matchesTo &&
      matchesMin &&
      matchesMax
    )
  })

const summarizeExpenses = (expenses) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const highestExpense = expenses.reduce((max, expense) => Math.max(max, expense.amount), 0)
  const categoryCounts = expenses.reduce((counts, expense) => {
    counts[expense.category] = (counts[expense.category] || 0) + 1
    return counts
  }, {})
  const mostUsedCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

  return {
    totalExpenses,
    transactionCount: expenses.length,
    averageTransaction: expenses.length ? totalExpenses / expenses.length : 0,
    highestExpense,
    mostUsedCategory,
    currentMonthSpending: Math.round(totalExpenses * 0.41),
    previousMonthSpending: Math.round(totalExpenses * 0.34),
    percentageChange: 18.1,
  }
}

const getSpentByCategory = (expenses, category) =>
  expenses
    .filter((expense) => category === 'Overall' || expense.category === category)
    .reduce((sum, expense) => sum + expense.amount, 0)

export const expenseApi = {
  getDashboardSummary: () => {
    const expenses = getExpensesFromStorage()
    return wait({
      summary: summarizeExpenses(expenses),
      recentExpenses: [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
      alerts: [
        'Food budget has reached 82%.',
        '1 unusual expense was detected this month.',
        'Spending is 18% higher than last month.',
      ],
    })
  },
  getExpenses: (filters = {}) => wait(filterExpenses(getExpensesFromStorage(), filters)),
  getExpenseById: (id) =>
    wait(getExpensesFromStorage().find((expense) => String(expense.id) === String(id)) || null),
  createExpense: (data) => {
    const expenses = getExpensesFromStorage()
    const expense = normalizeExpense({
      ...data,
      id: Date.now(),
      predictedCategory: data.predictedCategory || data.category,
      predictionConfidence: data.predictionConfidence || 0.82,
      anomalyStatus: Number(data.amount) > 20000 ? 'unusual' : 'normal',
      anomalyScore: Number(data.amount) > 20000 ? -0.61 : 0.16,
      anomalyExplanation:
        Number(data.amount) > 20000
          ? `This expense is unusual compared with your normal ${data.category} transactions.`
          : `This expense is within your usual ${data.category} spending range.`,
    })
    return wait(writeStored(STORAGE_KEY, [expense, ...expenses])[0])
  },
  updateExpense: (id, data) => {
    const expenses = getExpensesFromStorage()
    const updated = expenses.map((expense) =>
      String(expense.id) === String(id) ? normalizeExpense({ ...expense, ...data, id: expense.id }) : expense,
    )
    writeStored(STORAGE_KEY, updated)
    return wait(updated.find((expense) => String(expense.id) === String(id)))
  },
  deleteExpense: (id) => {
    const expenses = getExpensesFromStorage().filter((expense) => String(expense.id) !== String(id))
    writeStored(STORAGE_KEY, expenses)
    return wait({ success: true })
  },
  predictExpenseCategory: (description) => {
    const text = description.toLowerCase()
    const category = text.includes('uber') || text.includes('bus') || text.includes('fuel')
      ? 'Transport'
      : text.includes('food') || text.includes('lunch') || text.includes('restaurant')
        ? 'Food'
        : text.includes('rent') || text.includes('hotel')
          ? 'Housing'
          : EXPENSE_CATEGORIES[Math.min(description.length % EXPENSE_CATEGORIES.length, EXPENSE_CATEGORIES.length - 1)]
    return wait({ predictedCategory: category, confidence: 0.88 })
  },
  getBudgets: () => {
    const expenses = getExpensesFromStorage()
    const budgets = readStored(BUDGET_STORAGE_KEY, mockBudgets).map((budget) => {
      const spent = getSpentByCategory(expenses, budget.category)
      return { ...budget, spent }
    })
    return wait(budgets)
  },
  createBudget: (data) => {
    const budgets = readStored(BUDGET_STORAGE_KEY, mockBudgets)
    const existing = budgets.find((budget) => budget.category === data.category)
    if (existing) throw new Error('A budget for this category already exists.')
    const budget = { id: Date.now(), category: data.category, amount: Number(data.amount) }
    return wait(writeStored(BUDGET_STORAGE_KEY, [...budgets, budget]).at(-1))
  },
  updateBudget: (id, data) => {
    const budgets = readStored(BUDGET_STORAGE_KEY, mockBudgets)
    const updated = budgets.map((budget) =>
      String(budget.id) === String(id) ? { ...budget, ...data, amount: Number(data.amount) } : budget,
    )
    writeStored(BUDGET_STORAGE_KEY, updated)
    return wait(updated.find((budget) => String(budget.id) === String(id)))
  },
  getSmartInsights: () =>
    wait([
      {
        type: 'information',
        title: 'Food is your highest-frequency category',
        message: 'Review weekly restaurant spending to find small savings without major lifestyle changes.',
        period: 'This month',
        metric: 'Most frequent',
      },
      {
        type: 'warning',
        title: 'Monthly spending increased',
        message: 'Your spending is 18% higher than last month. Housing and Food drove most of the change.',
        period: 'Month over month',
        metric: '+18.1%',
      },
      {
        type: 'critical',
        title: 'Unusual expense detected',
        message: 'One transaction is unusual compared with your normal spending pattern.',
        period: 'Recent activity',
        metric: '1 item',
      },
    ]),
  getUnusualExpenses: () => wait(getExpensesFromStorage().filter((expense) => expense.anomalyStatus === 'unusual')),
  downloadExpensesCsv: async (filters = {}) => {
    const expenses = filterExpenses(getExpensesFromStorage(), filters)
    const header = ['Date', 'Description', 'Amount', 'Category', 'Payment Method', 'Predicted Category', 'Anomaly']
    const rows = expenses.map((expense) => [
      expense.date,
      expense.description,
      expense.amount,
      expense.category,
      expense.paymentMethod,
      expense.predictedCategory,
      expense.anomalyStatus,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses_${csvDateStamp()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    return wait({ success: true })
  },
}
