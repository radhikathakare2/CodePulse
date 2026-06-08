import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { formatDate } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function RatingGraph({ data = [], platform = 'codeforces' }) {
  const platformColors = {
    codeforces: { stroke: '#3b82f6', gradient: ['#3b82f6', '#1d4ed8'] },
    leetcode: { stroke: '#f97316', gradient: ['#f97316', '#c2410c'] },
    codechef: { stroke: '#92400e', gradient: ['#d97706', '#92400e'] },
  }

  const { stroke, gradient } = platformColors[platform] || platformColors.codeforces

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No rating data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`ratingGrad-${platform}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradient[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={gradient[1]} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v, 'MMM yy')}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['dataMin - 100', 'dataMax + 100']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="rating"
          name="Rating"
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#ratingGrad-${platform})`}
          dot={{ fill: stroke, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: stroke, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
