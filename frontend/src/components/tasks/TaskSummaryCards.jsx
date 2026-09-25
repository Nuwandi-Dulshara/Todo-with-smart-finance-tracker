import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from 'lucide-react'
import StatCard from '../common/StatCard'

function TaskSummaryCards({ totalLabel = 'Total Tasks', stats }) {
  return (
    <section className="stats-grid task-summary-grid">
      <StatCard icon={ListTodo} label={totalLabel} value={stats.total} />
      <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="green" />
      <StatCard icon={Clock3} label="Pending" value={stats.pending} tone="amber" />
      <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} tone="red" />
    </section>
  )
}

export default TaskSummaryCards
