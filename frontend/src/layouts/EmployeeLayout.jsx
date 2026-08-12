import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, User, History, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ui/ThemeToggle.jsx'

const NAV = [
  { to: '/employee',         icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/employee/profile', icon: User,            label: 'Profile' },
  { to: '/employee/logins',  icon: History,         label: 'My Logins' },
]

export default function EmployeeLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-cyber-dark">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-cyber-card border-r border-slate-200 dark:border-cyber-border">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-cyber-border">
          <div className="p-2 bg-brand-600 rounded-xl">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">AccountGuard</p>
            <p className="text-xs text-slate-400">Employee Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-200 dark:border-cyber-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] || 'E'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Employee</p>
            </div>
          </div>
          <button onClick={logout} className="nav-item w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-cyber-card border-b border-slate-200 dark:border-cyber-border">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
          </p>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
