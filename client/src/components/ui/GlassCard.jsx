import { clsx } from 'clsx'

export default function GlassCard({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl',
        hover && 'hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
