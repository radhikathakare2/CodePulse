import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'

export default function StatCard({ icon: Icon, label, value, change, changeLabel, gradient, delay = 0, onClick }) {
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0 || change === undefined || change === null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6',
        'hover:bg-white/10 hover:border-white/20 transition-all duration-300',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Gradient orb background */}
      <div className={clsx(
        'absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-xl',
        gradient || 'bg-gradient-to-br from-brand-500 to-accent-500'
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            gradient ? `bg-gradient-to-br ${gradient} opacity-20` : 'bg-brand-500/20',
          )}>
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              gradient ? `bg-gradient-to-br ${gradient}` : 'bg-brand-500/30',
            )}>
              {Icon && <Icon size={20} className="text-white" />}
            </div>
          </div>

          {!isNeutral && (
            <div className={clsx(
              'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            )}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{change}{changeLabel || '%'}
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold font-display text-white mb-1">{value}</p>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}
