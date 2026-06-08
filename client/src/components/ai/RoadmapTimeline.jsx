import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, BookOpen, Code, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '../ui/Badge'

export default function RoadmapTimeline({ weeks = [], onToggleWeek }) {
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([0]))

  const toggleExpand = (idx) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  if (!weeks.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No roadmap data. Click "Generate Roadmap" to create your personalized plan.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {weeks.map((week, idx) => {
        const isExpanded = expandedWeeks.has(idx)
        const completedProblems = week.problems?.filter(p => p.completed)?.length || 0
        const totalProblems = week.problems?.length || 0
        const progressPct = totalProblems ? (completedProblems / totalProblems) * 100 : 0

        return (
          <motion.div
            key={week.weekId || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${
              week.completed ? 'border-emerald-500/30' : 'border-white/10'
            }`}
          >
            {/* Week Header */}
            <button
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(idx)}
            >
              {/* Week indicator */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                week.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-brand-500/20 text-brand-400'
              }`}>
                {week.completed
                  ? <CheckCircle size={18} />
                  : <span className="text-sm font-bold">{idx + 1}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{week.title || `Week ${idx + 1}`}</h3>
                  {week.difficulty && (
                    <Badge variant={week.difficulty?.toLowerCase()}>{week.difficulty}</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{week.description}</p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-gray-500">{completedProblems}/{totalProblems}</span>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                </div>
              </div>
            </button>

            {/* Progress Bar */}
            <div className="px-5 pb-0">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-5 pt-4"
              >
                {week.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {week.topics.map(t => (
                      <Badge key={t} variant="purple">{t}</Badge>
                    ))}
                  </div>
                )}

                {week.problems?.length > 0 && (
                  <div className="space-y-2">
                    {week.problems.map((problem, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => onToggleWeek?.(week.weekId || idx, pIdx)}
                      >
                        {problem.completed
                          ? <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                          : <Circle size={15} className="text-gray-600 shrink-0" />
                        }
                        <span className={`text-xs flex-1 ${problem.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {problem.name}
                        </span>
                        {problem.difficulty && (
                          <Badge variant={problem.difficulty?.toLowerCase()} className="text-xs shrink-0">
                            {problem.difficulty}
                          </Badge>
                        )}
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-brand-400 hover:text-brand-300"
                          >
                            <Code size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
