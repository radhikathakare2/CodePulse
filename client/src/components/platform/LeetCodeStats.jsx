import { Flame, Award, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'

export default function LeetCodeStats({ stats }) {
  if (!stats) return null

  const { solved, total, easy, medium, hard, streak, acceptanceRate, contestRating, ranking } = stats

  const pieData = [
    { name: 'Easy', value: easy || 0, color: '#10b981' },
    { name: 'Medium', value: medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: hard || 0, color: '#f43f5e' },
    { name: 'Remaining', value: Math.max(0, (total || 2500) - (solved || 0)), color: 'rgba(255,255,255,0.05)' },
  ]

  return (
    <div className="space-y-4">
      {/* Solved Ring */}
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{solved || 0}</span>
            <span className="text-xs text-gray-500">/{total || '—'}</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { label: 'Easy', value: easy, color: 'text-emerald-400', bg: 'bg-emerald-500' },
            { label: 'Medium', value: medium, color: 'text-amber-400', bg: 'bg-amber-500' },
            { label: 'Hard', value: hard, color: 'text-rose-400', bg: 'bg-rose-500' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`text-xs ${color} w-12 font-medium`}>{label}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bg} rounded-full`}
                  style={{ width: `${total ? ((value || 0) / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-white font-semibold w-8 text-right">{value || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Streak', value: `${streak || 0}d`, icon: Flame, color: 'text-orange-400' },
          { label: 'Acceptance', value: `${acceptanceRate || 0}%`, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Contest Rating', value: contestRating || '—', icon: Award, color: 'text-amber-400' },
          { label: 'Global Rank', value: ranking ? `#${ranking.toLocaleString()}` : '—', icon: Award, color: 'text-brand-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className={color} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-base font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
