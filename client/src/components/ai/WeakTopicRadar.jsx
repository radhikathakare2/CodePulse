import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-100/95 backdrop-blur-lg border border-white/10 rounded-xl p-2 text-xs">
      <p className="text-gray-400">{payload[0].payload.topic}</p>
      <p className="text-brand-400 font-bold">{payload[0].value}%</p>
    </div>
  )
}

export default function WeakTopicRadar({ data = [] }) {
  const defaultData = [
    { topic: 'Arrays', score: 75 },
    { topic: 'Graphs', score: 45 },
    { topic: 'DP', score: 55 },
    { topic: 'Trees', score: 70 },
    { topic: 'Binary Search', score: 80 },
    { topic: 'Greedy', score: 60 },
    { topic: 'Strings', score: 65 },
    { topic: 'Math', score: 50 },
  ]

  const chartData = data.length ? data : defaultData

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          tickCount={4}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Proficiency"
          dataKey="score"
          stroke="#7c3aed"
          fill="#7c3aed"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ fill: '#7c3aed', r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
