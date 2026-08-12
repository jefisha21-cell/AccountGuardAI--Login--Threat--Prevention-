import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Monitor, Globe, Clock, MapPin, Smartphone, ChromeIcon } from 'lucide-react'
import RiskBadge from '../../components/ui/RiskBadge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { getMyLogins, getProfile } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'

function fmt(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export default function EmployeeDashboard() {
  const { user }           = useAuth()
  const [profile, setProfile] = useState(null)
  const [logins, setLogins]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProfile(), getMyLogins()])
      .then(([p, l]) => { setProfile(p.data); setLogins(l.data) })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={36} /></div>

  const lastLogin = logins[logins.length - 1]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={`Welcome, ${profile?.name || user?.name}`} subtitle="Your account security overview" />

      {/* Current session card */}
      {lastLogin && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card
          border-brand-200 dark:border-brand-500/20 bg-gradient-to-r
          from-brand-50 to-indigo-50 dark:from-brand-500/5 dark:to-indigo-500/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-600 rounded-xl">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Latest Login Session</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{fmt(lastLogin.login_time)}</p>
            </div>
            <div className="ml-auto">
              <RiskBadge risk={lastLogin.risk_prediction} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Globe,   label: 'IP Address', value: lastLogin.ip_address },
              { icon: ChromeIcon, label: 'Browser',  value: lastLogin.browser },
              { icon: Smartphone, label: 'Device',   value: lastLogin.device },
              { icon: Monitor,    label: 'OS',       value: lastLogin.operating_system },
              { icon: MapPin,     label: 'Location', value: lastLogin.location },
              { icon: Clock,      label: 'Time',     value: fmt(lastLogin.login_time) },
            ].map(item => (
              <div key={item.label} className="bg-white/60 dark:bg-white/5 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon size={13} className="text-brand-500" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.value || '—'}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            {lastLogin.new_device === 'Yes' && (
              <span className="badge-medium">New Device Detected</span>
            )}
            {lastLogin.new_location === 'Yes' && (
              <span className="badge-medium">New Location Detected</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Account info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Account Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Employee ID',  value: profile?.employee_id },
              { label: 'Department',   value: profile?.department },
              { label: 'Role',         value: profile?.role },
              { label: 'Status',       value: profile?.status },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.value || '—'}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Login Statistics</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Logins',  value: logins.length },
              { label: 'Normal Logins', value: logins.filter(l => l.risk_prediction === 'Normal').length },
              { label: 'Medium Risk',   value: logins.filter(l => l.risk_prediction === 'Medium').length },
              { label: 'High Risk',     value: logins.filter(l => l.risk_prediction === 'Suspicious').length },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
