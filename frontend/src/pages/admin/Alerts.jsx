import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, ShieldX, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getAlerts, markAlertRead } from '../../services/api.js'
import toast from 'react-hot-toast'

function fmt(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function AdminAlerts() {
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(null)

  const load = () => {
    setLoading(true)
    getAlerts()
      .then(r => setAlerts(r.data))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleMark = async (empId) => {
    setMarking(empId)
    try {
      await markAlertRead(empId)
      toast.success('Marked as read')
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setMarking(null)
    }
  }

  const unread = alerts.filter(a => a.status === 'Unread').length

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Security Alerts"
        subtitle={`${unread} unread alert${unread !== 1 ? 's' : ''}`}
        action={
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : alerts.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-slate-400 dark:text-slate-500">
          <BellOff size={40} className="mb-3 opacity-40" />
          <p className="font-medium">No alerts yet</p>
          <p className="text-sm mt-1">Suspicious logins will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card relative overflow-hidden
                  ${alert.status === 'Unread'
                    ? 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                    : 'opacity-70'
                  }`}
              >
                {/* Unread indicator */}
                {alert.status === 'Unread' && (
                  <span className="absolute top-4 right-4">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-red-100 dark:bg-red-500/15 rounded-xl flex-shrink-0">
                    <ShieldX size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{alert.employee_name}</p>
                      <span className="badge-high">High Risk</span>
                      {alert.status === 'Unread' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                          <Bell size={10} /> Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{alert.email}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'IP', value: alert.ip_address },
                        { label: 'Browser', value: alert.browser },
                        { label: 'Device', value: alert.device },
                        { label: 'OS', value: alert.operating_system },
                        { label: 'Location', value: alert.location },
                        { label: 'Time', value: fmt(alert.login_time) },
                      ].map(item => (
                        <div key={item.label} className="bg-white/50 dark:bg-white/5 rounded-lg px-3 py-2">
                          <p className="text-slate-400 dark:text-slate-500 mb-0.5">{item.label}</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.value || '—'}</p>
                        </div>
                      ))}
                    </div>

                    {alert.status === 'Unread' && (
                      <button
                        onClick={() => handleMark(alert.employee_id)}
                        disabled={marking === alert.employee_id}
                        className="mt-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                          bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300
                          hover:bg-slate-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        {marking === alert.employee_id ? <Spinner size={12} /> : <BellOff size={13} />}
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
