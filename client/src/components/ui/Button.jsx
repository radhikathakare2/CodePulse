import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', disabled = false, loading = false, className = '', leftIcon: LeftIcon, rightIcon: RightIcon, ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500/50'

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-accent-500 hover:from-brand-700 hover:to-accent-600 text-white shadow-lg hover:shadow-glow-purple',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm',
    outline: 'border border-brand-500 text-brand-400 hover:bg-brand-500/20 hover:text-brand-300',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/10',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 hover:text-rose-300',
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400',
    premium: 'bg-gradient-to-r from-brand-600 via-purple-500 to-accent-500 text-white shadow-lg hover:shadow-glow-purple animate-pulse-glow',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-2',
  }

  return (
    <button
      ref={ref}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon size={size === 'sm' || size === 'xs' ? 14 : 16} />}
          {children}
          {RightIcon && <RightIcon size={size === 'sm' || size === 'xs' ? 14 : 16} />}
        </>
      )}
    </button>
  )
})

export default Button
