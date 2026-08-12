import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Search, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Table from '../../components/ui/Table.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getEmployees, unblockEmployee } from '../../services/api.js'
import toast from 'react-hot-toast'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [unblocking, setUnblocking] = useState(null)

  const load = () => {
    setLoading(true)
    getEmployees()
      .then(r => { setEmployees(r.data); setFiltered(r.data) })
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) ||
      e.employee_id?.toLowerCase().includes(q)
    ))
  }, [search, employees])

  const handleUnblock = async (id) => {
    setUnblocking(id)
    try {
      await unblockEmployee(id)
      toast.success('Employee unblocked')
      load()
    } catch {
      toast.error('Failed to unblock')
    } finally {
      setUnblocking(null)
    }
  }

  const columns = [
    { key: 'employee_id', label: 'ID' },
    { key: 'name',        label: 'Name' },
    { key: 'email',       label: 'Email' },
    { key: 'department',  label: 'Department' },
    { key: 'role',        label: 'Role' },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <span className={v === 'Active' ? 'badge-active' : 'badge-blocked'}>{v}</span>
      )
    },
    { key: 'failed_attempts', label: 'Failed Attempts' },
    {
      key: 'employee_id', label: 'Action',
      render: (id, row) => row.status === 'Blocked' ? (
        <button
          onClick={() => handleUnblock(id)}
          disabled={unblocking === id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400
            hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors disabled:opacity-50"
        >
          {unblocking === id ? <Spinner size={12} /> : <UserCheck size={13} />}
          Unblock
        </button>
      ) : <span className="text-xs text-slate-400">—</span>
    }
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title="Employees" subtitle={`${employees.length} total employees registered`} />

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, department..."
              className="input pl-10"
            />
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card p-0 overflow-hidden">
            <Table columns={columns} data={filtered} emptyMsg="No employees found" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
