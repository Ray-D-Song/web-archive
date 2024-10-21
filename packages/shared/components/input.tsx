import * as React from 'react'

import { cn } from '../utils/helper'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    showRing?: boolean
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showRing,...props }, ref) => {
    const ringClassName = showRing === false ? '' : 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    const inputClassName = cn(
      ringClassName + ' flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )
    return (
      <input
        type={type}
        className={inputClassName}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
