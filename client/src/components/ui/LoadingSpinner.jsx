import { Zap } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', text = null }) {
  const sizes = {
    sm: { outer: 'w-8 h-8', inner: 'w-8 h-8', icon: 14 },
    md: { outer: 'w-16 h-16', inner: 'w-16 h-16', icon: 20 },
    lg: { outer: 'w-24 h-24', inner: 'w-24 h-24', icon: 28 },
  }

  const s = sizes[size] || sizes.md

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${s.outer} border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin`} />
        {/* Inner spinning ring (reverse) */}
        <div
          className={`absolute inset-0 ${s.inner} border-4 border-transparent border-t-accent-400 rounded-full animate-spin`}
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={s.icon} className="text-brand-400 animate-pulse" />
        </div>
      </div>
      {text && (
        <p className="text-gray-400 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
