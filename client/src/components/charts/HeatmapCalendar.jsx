import { useState, useMemo } from 'react'
import { format, parseISO, startOfWeek, addDays, addWeeks, getDay } from 'date-fns'
import { motion } from 'framer-motion'

const WEEK_COUNT = 52
const DAYS_IN_WEEK = 7

function getIntensityClass(count) {
  if (!count || count === 0) return 'bg-white/5 hover:bg-white/10'
  if (count <= 2) return 'bg-brand-900/80 hover:bg-brand-800'
  if (count <= 5) return 'bg-brand-700/80 hover:bg-brand-600'
  if (count <= 10) return 'bg-brand-500/90 hover:bg-brand-400'
  return 'bg-brand-400 hover:bg-brand-300 shadow-glow-sm'
}

export default function HeatmapCalendar({ data = {}, year = new Date().getFullYear() }) {
  const [tooltip, setTooltip] = useState(null)

  const { grid, months } = useMemo(() => {
    const startDate = new Date(year, 0, 1)
    const firstMonday = addDays(startDate, -getDay(startDate) + 1)

    const grid = []
    const monthLabels = []
    let lastMonth = -1

    for (let week = 0; week < WEEK_COUNT; week++) {
      const weekData = []
      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const date = addDays(firstMonday, week * 7 + day)
        const dateStr = format(date, 'yyyy-MM-dd')
        const count = data[dateStr] || 0
        const month = date.getMonth()

        if (day === 0 && month !== lastMonth && date.getFullYear() === year) {
          monthLabels.push({ week, label: format(date, 'MMM') })
          lastMonth = month
        }

        weekData.push({ date, dateStr, count, inYear: date.getFullYear() === year })
      }
      grid.push(weekData)
    }

    return { grid, months: monthLabels }
  }, [data, year])

  const totalSubmissions = Object.values(data).reduce((a, b) => a + b, 0)
  const activeDays = Object.values(data).filter(v => v > 0).length

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          <span className="text-white font-semibold">{totalSubmissions}</span> submissions ·{' '}
          <span className="text-white font-semibold">{activeDays}</span> active days
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Less</span>
          {[0, 2, 5, 10, 15].map((count) => (
            <div
              key={count}
              className={`w-3 h-3 rounded-sm ${getIntensityClass(count)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 ml-8" style={{ gap: '2px' }}>
            {grid.map((_, weekIdx) => {
              const label = months.find(m => m.week === weekIdx)
              return (
                <div key={weekIdx} className="w-3 text-xs text-gray-500 shrink-0">
                  {label ? label.label : ''}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-3 text-xs text-gray-600 flex items-center">{day}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map(({ date, dateStr, count, inYear }, dayIdx) => (
                    <motion.div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 ${
                        inYear ? getIntensityClass(count) : 'bg-transparent'
                      }`}
                      whileHover={{ scale: 1.3 }}
                      onMouseEnter={(e) => {
                        if (inYear) {
                          setTooltip({
                            date: format(date, 'MMM d, yyyy'),
                            count,
                            x: e.clientX,
                            y: e.clientY,
                          })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl text-xs shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
        >
          <div className="font-semibold text-white">{tooltip.count} submissions</div>
          <div className="text-gray-400">{tooltip.date}</div>
        </div>
      )}
    </div>
  )
}
