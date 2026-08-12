import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

export default function RiskBadge({ risk }) {
  const r = (risk || '').toLowerCase()
  if (r === 'suspicious' || r === 'high') {
    return <span className="badge-high"><ShieldX size={11} />High Risk</span>
  }
  if (r === 'medium') {
    return <span className="badge-medium"><ShieldAlert size={11} />Medium</span>
  }
  return <span className="badge-low"><ShieldCheck size={11} />Normal</span>
}
