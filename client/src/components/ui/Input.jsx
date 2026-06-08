import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, rightIcon: RightIcon, onRightIconClick, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500',
            'focus:outline-none focus:ring-1 transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            Icon && 'pl-10',
            RightIcon && 'pr-10',
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/30',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <RightIcon size={16} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
})

export default Input
