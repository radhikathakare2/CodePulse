import Badge from '../ui/Badge'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Star } from 'lucide-react'

const categoryConfig = {
  strength: { icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', badge: 'success' },
  weakness: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', badge: 'error' },
  improvement: { icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', badge: 'purple' },
  tip: { icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', badge: 'warning' },
}

export default function InsightCard({ insight, delay = 0 }) {
  const { text, category = 'tip', topic, impact } = insight
  const config = categoryConfig[category] || categoryConfig.tip
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:bg-white/5 ${config.bg}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.bg} shrink-0`}>
        <Icon size={16} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {topic && <span className="text-xs font-semibold text-white">{topic}</span>}
          <Badge variant={config.badge} className="text-xs">{category}</Badge>
          {impact && (
            <Badge variant={impact === 'high' ? 'error' : impact === 'medium' ? 'warning' : 'success'} className="text-xs">
              {impact} impact
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}
