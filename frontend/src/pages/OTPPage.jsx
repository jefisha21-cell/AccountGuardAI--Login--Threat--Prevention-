import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, MailCheck } from 'lucide-react'
import { verifyOTP } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import toast from 'react-hot-toast'

export default function OTPPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const employee_id = location.state?.employee_id

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])

  useEffect(() => {
    if (!employee_id) navigate('/login')
    refs.current[0]?.focus()
  }, [])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('')
    const next = ['', '', '', '', '', '']
    pasted.forEach((c, i) => { if (/\d/.test(c)) next[i] = c })
    setOtp(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const submit = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await verifyOTP({ employee_id, otp: code })
      login(data.access_token, {
        employee_id: data.employee_id,
        name: data.employee_name || data.employee_id,
        role: data.role,
      })
      toast.success('OTP verified! Welcome.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden
      bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100
      dark:from-cyber-dark dark:via-[#0d1a3a] dark:to-[#0a0f1e]"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="inline-flex p-4 bg-amber-500 rounded-2xl shadow-2xl shadow-amber-500/40 mb-4"
          >
            <MailCheck size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">OTP Verification</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Medium risk detected — verify your identity</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-6">
            <Shield size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">A 6-digit OTP has been sent to your registered email address.</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((val, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                value={val}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl
                  border-2 border-slate-200 dark:border-white/20
                  bg-white dark:bg-white/5
                  text-slate-900 dark:text-white
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                  outline-none transition-all"
              />
            ))}
          </div>

          <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Spinner size={18} /> Verifying...</> : 'Verify OTP'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mx-auto mt-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
