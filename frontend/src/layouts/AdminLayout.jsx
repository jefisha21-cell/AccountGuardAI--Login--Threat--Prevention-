import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, History, Bell,
  BarChart2, LogOut, Shield, Menu, X,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',     end: true },
  { to: '/admin/employees',  icon: Users,           label: 'Employees' },
  { to: '/admin/login-history', icon: History,      label: 'Login History' },
  { to: '/admin/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/admin/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/admin/audit-logs', icon: ClipboardList,   label: 'Audit Logs' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full
      ${mobile ? 'w-full' : 'w-64'}
      bg-white dark:bg-cyber-card
      border-r border-slate-200 dark:border-cyber-border`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-cyber-border">
        <div className="p-2 bg-brand-600 rounded-xl">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">AccountGuard</p>
          <p className="text-xs text-slate-400">AI Security Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => mobile && setOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-cyber-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>
        <button onClick={logout} className="nav-item w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-cyber-dark">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-cyber-card border-b border-slate-200 dark:border-cyber-border flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
