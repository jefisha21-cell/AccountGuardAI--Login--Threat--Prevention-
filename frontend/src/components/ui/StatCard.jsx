import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, color = 'brand', delta }) {
  const colors = {
    brand:   'from-brand-500 to-brand-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber:   'from-amber-500 to-amber-600',
    red:     'from-red-500 to-red-600',
    violet:  'from-violet-500 to-violet-600',
    sky:     'from-sky-500 to-sky-600',
  }
  const bg = {
    brand:   'bg-brand-50 dark:bg-brand-500/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10',
    amber:   'bg-amber-50 dark:bg-amber-500/10',
    red:     'bg-red-50 dark:bg-red-500/10',
    violet:  'bg-violet-50 dark:bg-violet-500/10',
    sky:     'bg-sky-50 dark:bg-sky-500/10',
  }
  const text = {
    brand:   'text-brand-600 dark:text-brand-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber:   'text-amber-600 dark:text-amber-400',
    red:     'text-red-600 dark:text-red-400',
    violet:  'text-violet-600 dark:text-violet-400',
    sky:     'text-sky-600 dark:text-sky-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${bg[color]}`}>
        <Icon size={22} className={text[color]} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value ?? '—'}</p>
        {delta && <p className="text-xs text-slate-400 mt-0.5">{delta}</p>}
      </div>
      {/* gradient accent bar */}
      <div className={`w-1 h-12 rounded-full bg-gradient-to-b ${colors[color]} opacity-60`} />
    </motion.div>
  )
}
