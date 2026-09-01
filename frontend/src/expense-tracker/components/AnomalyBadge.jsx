import { AlertTriangle, CheckCircle2 } from 'lucide-react'

function AnomalyBadge({ status = 'normal', label }) {
  const isUnusual = status === 'unusual'

  return (
    <span className={`expense-anomaly-badge ${isUnusual ? 'is-unusual' : 'is-normal'}`}>
      {isUnusual ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
      {label || (isUnusual ? 'Unusual Expense' : 'Normal')}
    </span>
  )
}

export default AnomalyBadge
