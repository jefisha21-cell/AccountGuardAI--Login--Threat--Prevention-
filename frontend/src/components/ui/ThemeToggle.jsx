import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200
        bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20
        text-slate-600 dark:text-slate-300 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
