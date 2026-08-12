import { useEffect, useState } from 'react'
import { Search, RefreshCw, ClipboardList } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Table from '../../components/ui/Table.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getAuditLogs } from '../../services/api.js'
import toast from 'react-hot-toast'

function fmt(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

const ACTION_COLORS = {
  'Login':           'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  'Login Success':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  'Login Attempt':   'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-400',
  'Account Blocked': 'bg-red-100    text-red-700    dark:bg-red-500/20    dark:text-red-400',
  'Alert Created':   'bg-red-100    text-red-700    dark:bg-red-500/20    dark:text-red-400',
  'OTP Generated':   'bg-brand-100  text-brand-700  dark:bg-brand-500/20  dark:text-brand-400',
  'OTP Verified':    'bg-brand-100  text-brand-700  dark:bg-brand-500/20  dark:text-brand-400',
  'Unblock Employee':'bg-sky-100    text-sky-700    dark:bg-sky-500/20    dark:text-sky-400',
  'Register Employee':'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
}

export default function AdminAuditLogs() {
  const [logs, setLogs]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAuditLogs()
      .then(r => { setLogs(r.data); setFiltered(r.data) })
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(logs.filter(l =>
      l.user?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    ))
  }, [search, logs])

  const columns = [
    { key: 'timestamp', label: 'Time',
      render: v => <span className="text-xs text-slate-500 dark:text-slate-400">{fmt(v)}</span> },
    { key: 'user',   label: 'User' },
    {
      key: 'action', label: 'Action',
      render: v => {
        const cls = ACTION_COLORS[v] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
        return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{v}</span>
      }
    },
    { key: 'description', label: 'Description' },
    { key: 'ip',          label: 'IP Address' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Logs"
        subtitle={`${logs.length} total audit events`}
        action={
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <ClipboardList size={14} />
            All admin and system actions
          </div>
        }
      />

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="input pl-10" />
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
          <Table columns={columns} data={filtered} emptyMsg="No audit logs found" />
        </div>
      )}
    </div>
  )
}
