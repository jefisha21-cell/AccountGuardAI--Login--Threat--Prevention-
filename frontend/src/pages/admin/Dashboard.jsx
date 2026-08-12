import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserX, LogIn, ShieldAlert, ShieldX, Bell, Activity } from 'lucide-react'
import StatCard from '../../components/ui/StatCard.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getDashboard } from '../../services/api.js'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={36} />
    </div>
  )

  const cards = [
    { title: 'Total Employees',   value: data?.total_employees,   icon: Users,       color: 'brand'   },
    { title: 'Blocked Accounts',  value: data?.blocked_employees, icon: UserX,       color: 'red'     },
    { title: "Today's Logins",    value: data?.todays_logins,     icon: LogIn,       color: 'emerald' },
    { title: 'Medium Risk',       value: data?.medium_risk,       icon: ShieldAlert, color: 'amber'   },
    { title: 'High Risk Logins',  value: data?.high_risk,         icon: ShieldX,     color: 'red'     },
    { title: 'Unread Alerts',     value: data?.unread_alerts,     icon: Bell,        color: 'violet'  },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Security Dashboard"
        subtitle="Real-time overview of your organisation's login security"
      />

      {/* System status banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-4 rounded-2xl
          bg-emerald-50 dark:bg-emerald-500/10
          border border-emerald-200 dark:border-emerald-500/20 mb-6"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <Activity size={16} className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          AI Monitoring Active — All systems operational
        </p>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Security Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Account block threshold', value: '5 failed attempts' },
              { label: 'OTP validity',             value: '5 minutes' },
              { label: 'JWT token expiry',         value: '24 hours' },
              { label: 'Risk model',               value: 'Random Forest Classifier' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Alert Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Alerts',  value: data?.total_alerts,   color: 'text-slate-800 dark:text-slate-200' },
              { label: 'Unread',        value: data?.unread_alerts,  color: 'text-red-600 dark:text-red-400' },
              { label: 'Read',          value: (data?.total_alerts || 0) - (data?.unread_alerts || 0), color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
