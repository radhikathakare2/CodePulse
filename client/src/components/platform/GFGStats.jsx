import { BookOpen, Award, GraduationCap } from 'lucide-react'

export default function GFGStats({ stats }) {
  if (!stats) return null

  const { totalSolved, codingScore, institutionRank, easy, medium, hard, monthlyScore } = stats

  const difficulties = [
    { label: 'Easy', value: easy || 0, color: '#10b981', max: 400 },
    { label: 'Medium', value: medium || 0, color: '#f59e0b', max: 300 },
    { label: 'Hard', value: hard || 0, color: '#f43f5e', max: 200 },
  ]

  return (
    <div className="space-y-4">
      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Solved', value: totalSolved || 0, icon: BookOpen, color: 'text-green-400' },
          { label: 'Coding Score', value: codingScore || 0, icon: Award, color: 'text-amber-400' },
          { label: 'Inst. Rank', value: institutionRank ? `#${institutionRank}` : '—', icon: GraduationCap, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
            <Icon size={16} className={`${color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Score */}
      {monthlyScore !== undefined && (
        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Monthly Score</span>
          <span className="text-lg font-bold text-green-400">{monthlyScore}</span>
        </div>
      )}

      {/* Difficulty Bars */}
      <div className="space-y-3">
        {difficulties.map(({ label, value, color, max }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="font-bold" style={{ color }}>{value}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
