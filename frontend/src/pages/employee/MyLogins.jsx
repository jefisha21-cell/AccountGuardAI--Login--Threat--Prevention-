import { useEffect, useState } from 'react'
import { History, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Table from '../../components/ui/Table.jsx'
import RiskBadge from '../../components/ui/RiskBadge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getMyLogins } from '../../services/api.js'
import toast from 'react-hot-toast'

function fmt(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function EmployeeLogins() {
  const [logins, setLogins]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getMyLogins()
      .then(r => setLogins(r.data))
      .catch(() => toast.error('Failed to load login history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const columns = [
    { key: 'ip_address',    label: 'IP Address' },
    { key: 'browser',       label: 'Browser' },
    { key: 'device',        label: 'Device' },
    { key: 'operating_system', label: 'OS' },
    { key: 'location',      label: 'Location' },
    { key: 'new_device',    label: 'New Device',   render: v => <span className={v === 'Yes' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}>{v}</span> },
    { key: 'new_location',  label: 'New Location', render: v => <span className={v === 'Yes' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'}>{v}</span> },
    { key: 'risk_prediction', label: 'Risk',  render: v => <RiskBadge risk={v} /> },
    { key: 'login_time',    label: 'Time',    render: v => <span className="text-xs text-slate-500 dark:text-slate-400">{fmt(v)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Login History"
        subtitle={`${logins.length} login records`}
        action={
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : logins.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-slate-400">
          <History size={40} className="mb-3 opacity-40" />
          <p>No login history yet</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <Table columns={columns} data={logins} emptyMsg="No logins found" />
        </div>
      )}
    </div>
  )
}
