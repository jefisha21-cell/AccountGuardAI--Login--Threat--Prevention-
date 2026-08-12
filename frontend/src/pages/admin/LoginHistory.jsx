import { useEffect, useState } from 'react'
import { Search, Download, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Table from '../../components/ui/Table.jsx'
import RiskBadge from '../../components/ui/RiskBadge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getLoginHistory } from '../../services/api.js'
import toast from 'react-hot-toast'

function fmt(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function AdminLoginHistory() {
  const [logs, setLogs]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getLoginHistory()
      .then(r => { setLogs(r.data); setFiltered(r.data) })
      .catch(() => toast.error('Failed to load login history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(logs.filter(l =>
      l.employee_name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.browser?.toLowerCase().includes(q) ||
      l.risk_prediction?.toLowerCase().includes(q)
    ))
  }, [search, logs])

  const exportCSV = () => {
    const headers = ['Employee','Email','IP','Browser','Device','OS','Location','New Device','New Location','Risk','Time']
    const rows = filtered.map(l => [
      l.employee_name, l.email, l.ip_address, l.browser, l.device,
      l.operating_system, l.location, l.new_device, l.new_location,
      l.risk_prediction, fmt(l.login_time)
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'login_history.csv'; a.click()
  }

  const columns = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'email',         label: 'Email' },
    { key: 'ip_address',    label: 'IP Address' },
    { key: 'browser',       label: 'Browser' },
    { key: 'device',        label: 'Device' },
    { key: 'operating_system', label: 'OS' },
    { key: 'location',      label: 'Location' },
    { key: 'new_device',    label: 'New Device',   render: v => <span className={v==='Yes'?'text-amber-600 dark:text-amber-400 font-medium':'text-slate-400'}>{v}</span> },
    { key: 'new_location',  label: 'New Location', render: v => <span className={v==='Yes'?'text-amber-600 dark:text-amber-400 font-medium':'text-slate-400'}>{v}</span> },
    { key: 'risk_prediction', label: 'Risk', render: v => <RiskBadge risk={v} /> },
    { key: 'login_time',    label: 'Time', render: v => <span className="text-xs text-slate-500 dark:text-slate-400">{fmt(v)}</span> },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Login History"
        subtitle={`${logs.length} total login records`}
        action={
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15} /> Export CSV
          </button>
        }
      />

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee, location, risk..." className="input pl-10" />
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <Table columns={columns} data={filtered} emptyMsg="No login records found" />
        </div>
      )}
    </div>
  )
}
