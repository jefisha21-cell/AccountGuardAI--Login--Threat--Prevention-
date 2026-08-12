import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import {
  getRiskDistribution, getBrowserStats,
  getLocationStats, getDepartmentStats, getDailyLogins
} from '../../services/api.js'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#ec4899','#14b8a6']

const DARK_TICK = { fill: '#94a3b8', fontSize: 12 }

function ChartCard({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}

export default function AdminAnalytics() {
  const [risk, setRisk]       = useState([])
  const [browser, setBrowser] = useState([])
  const [location, setLocation] = useState([])
  const [dept, setDept]       = useState([])
  const [daily, setDaily]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getRiskDistribution(),
      getBrowserStats(),
      getLocationStats(),
      getDepartmentStats(),
      getDailyLogins()
    ]).then(([r, b, l, d, dl]) => {
      setRisk(r.data)
      setBrowser(b.data)
      setLocation(l.data.slice(0, 8))
      setDept(d.data)
      setDaily(dl.data)
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={36} /></div>

  const riskData = risk.map(r => ({
    name: r.risk === 'Suspicious' ? 'High Risk' : (r.risk || 'Normal'),
    value: r.count
  }))

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Analytics" subtitle="Visual breakdown of login patterns and risk distribution" />

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {riskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Browser Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={browser} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="browser" tick={DARK_TICK} />
              <YAxis tick={DARK_TICK} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Distribution">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={dept} dataKey="count" nameKey="department" cx="50%" cy="50%"
                outerRadius={90} paddingAngle={3}
                label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
              >
                {dept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Login Locations">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={location} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={DARK_TICK} />
              <YAxis type="category" dataKey="location" tick={{ ...DARK_TICK, fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Daily logins — full width */}
      <ChartCard title="Daily Login Trend (Last 30 days)">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={DARK_TICK} />
            <YAxis tick={DARK_TICK} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }} />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
              fill="url(#loginGrad)" dot={false} activeDot={{ r: 5 }} name="Logins" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
