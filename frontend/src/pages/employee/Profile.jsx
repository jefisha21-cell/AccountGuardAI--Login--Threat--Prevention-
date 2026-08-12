import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Briefcase, Shield, Hash } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getProfile } from '../../services/api.js'
import toast from 'react-hot-toast'

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .then(r => setProfile(r.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={36} /></div>

  const fields = [
    { icon: Hash,       label: 'Employee ID', value: profile?.employee_id },
    { icon: User,       label: 'Full Name',   value: profile?.name },
    { icon: Mail,       label: 'Email',       value: profile?.email },
    { icon: Briefcase,  label: 'Department',  value: profile?.department },
    { icon: Shield,     label: 'Role',        value: profile?.role },
    { icon: User,       label: 'Status',      value: profile?.status },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Profile" subtitle="Your account information" />

      <div className="max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-600/30">
              {profile?.name?.[0] || 'E'}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{profile?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
              <span className={`mt-1 ${profile?.status === 'Active' ? 'badge-active' : 'badge-blocked'}`}>
                {profile?.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 flex-shrink-0">
                  <item.icon size={16} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{item.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
