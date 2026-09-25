import { csvDateStamp } from '../utils/date'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const AUTH_STORAGE_KEY = 'task-flow-session'
const AUTH_EXPIRED_EVENT = 'organix-auth-expired'

const getSession = () => {
  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return storedSession ? JSON.parse(storedSession) : null
  } catch {
    return null
  }
}

const getToken = () => getSession()?.access_token || ''

const clearExpiredSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
}

const toQueryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  return query.toString()
}

const mapFiltersToApi = (filters = {}) => ({
  search: filters.search,
  category: filters.category,
  payment_method: filters.paymentMethod,
  date_from: filters.dateFrom,
  date_to: filters.dateTo,
  min_amount: filters.minAmount,
  max_amount: filters.maxAmount,
  anomaly_status: filters.anomalyStatus,
})

const parseError = async (response) => {
  const body = await response.json().catch(() => ({}))
  if (typeof body.detail === 'string') return body.detail
  if (body.detail?.message) return body.detail.message
  if (body.message) return body.message
  if (Array.isArray(body.detail)) return body.detail.map((item) => item.msg).join(' ')
  return 'Expense Tracker request failed.'
}

const request = async (path, options = {}) => {
  const token = getToken()
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to Organix AI backend. Make sure the FastAPI server is running on port 8000.', {
        cause: error,
      })
    }
    throw error
  }

  if (!response.ok) {
    if (response.status === 401) clearExpiredSession()
    throw new Error(await parseError(response))
  }

  if (response.status === 204) return null
  return response.json()
}

const mapExpenseFromApi = (expense) => ({
  id: expense.id,
  date: expense.date,
  description: expense.description,
  amount: Number(expense.amount || 0),
  category: expense.category,
  paymentMethod: expense.payment_method,
  notes: expense.notes || '',
  predictedCategory: expense.predicted_category || expense.category,
  predictionConfidence: Number(expense.prediction_confidence || 0),
  anomalyStatus: expense.anomaly_status || 'normal',
  anomalyScore: expense.anomaly_score,
  anomalyExplanation: expense.anomaly_explanation || '',
  createdAt: expense.created_at,
  updatedAt: expense.updated_at,
})

const mapExpenseToApi = (expense) => ({
  date: expense.date,
  description: expense.description,
  amount: Number(expense.amount),
  category: expense.category,
  payment_method: expense.paymentMethod,
  notes: expense.notes || null,
})

const mapBudgetFromApi = (budget) => ({
  id: budget.id,
  category: budget.category || 'Overall',
  month: budget.month,
  amount: Number(budget.budget_amount || 0),
  spent: Number(budget.spent || 0),
  remaining: Number(budget.remaining || 0),
  usedPercentage: Number(budget.used_percentage || 0),
  status: budget.status,
  createdAt: budget.created_at,
  updatedAt: budget.updated_at,
})

const mapBudgetToApi = (budget) => ({
  category: budget.category === 'Overall' ? null : budget.category,
  month: budget.month || new Date().toISOString().slice(0, 7),
  budget_amount: Number(budget.amount),
})

const mapSummaryFromApi = (summary) => ({
  totalExpenses: Number(summary.total_expenses || 0),
  transactionCount: Number(summary.transaction_count || 0),
  averageTransaction: Number(summary.average_transaction || 0),
  highestExpense: Number(summary.highest_expense || 0),
  mostUsedCategory: summary.most_used_category || 'None',
  currentMonthSpending: Number(summary.current_month_spending || 0),
  previousMonthSpending: Number(summary.previous_month_spending || 0),
  percentageChange: summary.percentage_change ?? null,
  unusualExpenseCount: Number(summary.unusual_expense_count || 0),
})

const mapInsightFromApi = (insight) => ({
  type: insight.type,
  title: insight.title,
  message: insight.message,
  period: insight.period,
  category: insight.category,
  metric: insight.metric,
})

export const expenseApi = {
  getDashboardSummary: () =>
    request('/expense-tracker/dashboard').then((data) => ({
      summary: mapSummaryFromApi(data.summary),
      recentExpenses: data.recent_expenses.map(mapExpenseFromApi),
      alerts: data.budget_alerts || [],
    })),
  getExpenses: (filters = {}) => {
    const query = toQueryString(mapFiltersToApi(filters))
    return request(`/expense-tracker/expenses${query ? `?${query}` : ''}`).then((data) =>
      data.expenses.map(mapExpenseFromApi),
    )
  },
  getExpenseById: (id) =>
    request(`/expense-tracker/expenses/${id}`).then((data) =>
      data.expense ? mapExpenseFromApi(data.expense) : null,
    ),
  createExpense: (data) =>
    request('/expense-tracker/expenses', {
      method: 'POST',
      body: JSON.stringify(mapExpenseToApi(data)),
    }).then((response) => mapExpenseFromApi(response.expense)),
  updateExpense: (id, data) =>
    request(`/expense-tracker/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mapExpenseToApi(data)),
    }).then((response) => mapExpenseFromApi(response.expense)),
  deleteExpense: (id) => request(`/expense-tracker/expenses/${id}`, { method: 'DELETE' }),
  predictExpenseCategory: (description) =>
    request('/expense-tracker/predict-category', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }).then((data) => ({
      predictedCategory: data.predicted_category,
      confidence: data.confidence,
    })),
  getBudgets: (month) => {
    const query = toQueryString({ month })
    return request(`/expense-tracker/budgets${query ? `?${query}` : ''}`).then((data) =>
      data.budgets.map(mapBudgetFromApi),
    )
  },
  createBudget: (data) =>
    request('/expense-tracker/budgets', {
      method: 'POST',
      body: JSON.stringify(mapBudgetToApi(data)),
    }).then((response) => mapBudgetFromApi(response.budget)),
  updateBudget: (id, data) =>
    request(`/expense-tracker/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mapBudgetToApi(data)),
    }).then((response) => mapBudgetFromApi(response.budget)),
  deleteBudget: (id) => request(`/expense-tracker/budgets/${id}`, { method: 'DELETE' }),
  getSmartInsights: () =>
    request('/expense-tracker/insights').then((data) => data.insights.map(mapInsightFromApi)),
  getUnusualExpenses: () =>
    request('/expense-tracker/unusual-expenses').then((data) => data.expenses.map(mapExpenseFromApi)),
  getChartImageUrl: async (chartName) => {
    const token = getToken()
    let response
    try {
      response = await fetch(`${API_BASE_URL}/expense-tracker/charts/${chartName}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Unable to connect to Organix AI backend. Make sure the FastAPI server is running on port 8000.', {
          cause: error,
        })
      }
      throw error
    }
    if (!response.ok) {
      if (response.status === 401) clearExpiredSession()
      throw new Error(await parseError(response))
    }
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  },
  downloadExpensesCsv: async (filters = {}) => {
    const token = getToken()
    const query = toQueryString(mapFiltersToApi(filters))
    let response
    try {
      response = await fetch(`${API_BASE_URL}/expense-tracker/export/csv${query ? `?${query}` : ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Unable to connect to Organix AI backend. Make sure the FastAPI server is running on port 8000.', {
          cause: error,
        })
      }
      throw error
    }
    if (!response.ok) {
      if (response.status === 401) clearExpiredSession()
      throw new Error(await parseError(response))
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses_${csvDateStamp()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    return { success: true }
  },
}
