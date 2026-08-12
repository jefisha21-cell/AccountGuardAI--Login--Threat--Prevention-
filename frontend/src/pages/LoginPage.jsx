import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle } from 'lucide-react'
import { loginAPI } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await loginAPI(form)

      // OTP required (medium risk)
      if (data.otp_required) {
        toast('OTP sent to your email', { icon: '📧' })
        navigate('/otp', { state: { employee_id: data.employee_id } })
        return
      }

      // Normal / low risk — JWT received
      login(data.access_token, {
        employee_id: data.employee_id,
        name:        data.employee_name,
        role:        data.role,
      })
      toast.success(`Welcome back, ${data.employee_name}!`)
    } catch (err) {
      const msg = err.response?.data?.detail
      if (typeof msg === 'object') {
        setError(msg.message || 'Login failed')
      } else {
        setError(msg || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden
      bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100
      dark:from-cyber-dark dark:via-[#0d1a3a] dark:to-[#0a0f1e]"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(to right,#6366f1 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex p-4 bg-brand-600 rounded-2xl shadow-2xl shadow-brand-600/40 mb-4"
          >
            <Shield size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AccountGuard AI</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">AI-Powered Identity Threat Detection</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Sign in to your account</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm mb-5"
            >
              <AlertTriangle size={16} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handle} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                />
                <button type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <><Spinner size={18} /> Authenticating...</> : 'Sign In'}
            </button>
          </form>

          {/* Info note */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-5">
            Protected by AI-based anomaly detection &amp; adaptive authentication
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 AccountGuard AI — Enterprise Security Platform
        </p>
      </motion.div>
    </div>
  )
}
