import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  LeetCode: '#f97316',
  Codeforces: '#3b82f6',
  GFG: '#22c55e',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, payload: { percentage } } = payload[0]
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white font-semibold">{name}</p>
      <p className="text-gray-400 text-sm">{value} problems ({percentage}%)</p>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percentage < 5) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percentage)}%`}
    </text>
  )
}

export default function PlatformDistribution({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No platform data available
      </div>
    )
  }

  const total = data.reduce((acc, d) => acc + d.value, 0)
  const dataWithPct = data.map(d => ({ ...d, percentage: total ? ((d.value / total) * 100).toFixed(1) : 0 }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={dataWithPct}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {dataWithPct.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || '#7c3aed'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2">
        {dataWithPct.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name] || '#7c3aed' }} />
            <span className="text-xs text-gray-400">{d.name}</span>
            <span className="text-xs font-semibold text-white">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
