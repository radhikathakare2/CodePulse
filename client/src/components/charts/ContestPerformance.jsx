import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { formatDate } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-3 shadow-xl min-w-32">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ContestPerformance({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No contest data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v, 'MMM d')}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="rank"
          orientation="left"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          reversed
          label={{ value: 'Rank', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
        />
        <YAxis
          yAxisId="rating"
          orientation="right"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Rating', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
        />
        <Bar
          yAxisId="rank"
          dataKey="rank"
          name="Rank"
          fill="rgba(124, 58, 237, 0.5)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Line
          yAxisId="rating"
          type="monotone"
          dataKey="ratingChange"
          name="Rating Δ"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={{ fill: '#22d3ee', r: 4 }}
          activeDot={{ r: 6, fill: '#22d3ee' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
