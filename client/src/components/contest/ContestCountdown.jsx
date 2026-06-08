import { useState, useEffect } from 'react'

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function ContestCountdown({ startTime }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime()
      const target = new Date(startTime).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft(null)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  if (!timeLeft) return null

  const units = timeLeft.days > 0
    ? [
        { label: 'days', val: timeLeft.days },
        { label: 'hrs', val: timeLeft.hours },
        { label: 'min', val: timeLeft.minutes },
      ]
    : [
        { label: 'hrs', val: timeLeft.hours },
        { label: 'min', val: timeLeft.minutes },
        { label: 'sec', val: timeLeft.seconds },
      ]

  return (
    <div className="flex items-center gap-1">
      {units.map(({ label, val }, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="bg-brand-600/20 border border-brand-500/30 rounded-lg px-2 py-1 min-w-8 text-center">
            <span className="text-sm font-bold font-display text-brand-300">{pad(val)}</span>
          </div>
          <span className="text-xs text-gray-500">{label}</span>
          {i < units.length - 1 && <span className="text-brand-500 font-bold mx-0.5">:</span>}
        </div>
      ))}
    </div>
  )
}
