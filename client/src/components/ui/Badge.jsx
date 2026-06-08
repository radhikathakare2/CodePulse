import { clsx } from 'clsx'

export default function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    premium: 'bg-gradient-to-r from-brand-600/30 to-accent-600/30 text-brand-300 border-brand-500/40',
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    leetcode: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    codeforces: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    codechef: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
    gfg: 'bg-green-500/20 text-green-400 border-green-500/30',
    easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    hard: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    purple: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    cyan: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
