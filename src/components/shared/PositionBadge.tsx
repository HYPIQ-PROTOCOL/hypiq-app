'use client'

interface PositionBadgeProps {
  position: 'LONG' | 'SHORT'
  theme?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'text' | 'pill'
}

export function PositionBadge({ 
  position, 
  theme = 'light', 
  size = 'md',
  variant = 'badge'
}: PositionBadgeProps) {
  const isDark = theme === 'dark'
  const isLong = position === 'LONG'
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  }
  
  // Color classes based on theme and position
  const getColorClasses = () => {
    const base = isLong ? 'emerald' : 'red'
    
    if (variant === 'text') {
      return isLong 
        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
        : isDark ? 'text-red-400' : 'text-red-600'
    }
    
    if (variant === 'pill') {
      return isLong
        ? isDark 
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
        : isDark
          ? 'bg-red-500/20 text-red-300 border border-red-400/30'
          : 'bg-red-100 text-red-700 border border-red-300'
    }
    
    // Default badge variant
    return isLong 
      ? isDark 
        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : isDark
        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
        : 'bg-red-50 text-red-700 border border-red-200'
  }
  
  const baseClasses = variant === 'text' 
    ? "font-bold tracking-wider uppercase inline" 
    : "font-bold tracking-wider uppercase"
  const variantClasses = variant === 'text' ? '' : 'rounded border'
  const colorClasses = getColorClasses()
  
  return (
    <span className={`
      ${baseClasses}
      ${variant !== 'text' ? sizeClasses[size] : ''}
      ${variantClasses}
      ${colorClasses}
    `.trim()}>
      {position}
    </span>
  )
}
