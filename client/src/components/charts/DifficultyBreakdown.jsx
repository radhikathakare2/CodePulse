import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

const COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#f43f5e',
}

export default function DifficultyBreakdown({ data = [] }) {
  const formatted = data.length
    ? data
    : [
        { name: 'Easy', value: 0, fill: COLORS.Easy },
        { name: 'Medium', value: 0, fill: COLORS.Medium },
        { name: 'Hard', value: 0, fill: COLORS.Hard },
      ]

  const total = formatted.reduce((acc, d) => acc + (d.value || 0), 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" name="Solved" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {formatted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#7c3aed'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-around mt-3">
        {formatted.map((d) => (
          <div key={d.name} className="text-center">
            <p className="text-lg font-bold" style={{ color: COLORS[d.name] }}>{d.value}</p>
            <p className="text-xs text-gray-500">{d.name}</p>
            {total > 0 && (
              <p className="text-xs text-gray-600">{Math.round((d.value / total) * 100)}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
