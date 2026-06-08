import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold text-sm text-brand-400">
          {entry.value} problems solved
        </p>
      ))}
    </div>
  )
}

export default function ActivityGraph({ data = [], period = 'monthly' }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
        No activity data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => period === 'monthly' ? formatDate(v, 'MMM') : formatDate(v, 'MMM d')}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#activityGrad)"
          dot={false}
          activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
