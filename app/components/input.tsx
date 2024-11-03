import { forwardRef } from "react"

import { cn } from "~/lib/utils"

const Input = forwardRef<React.ElementRef<"input">, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "ring-border focus-visible:ring-ring hover:ring-border-150 inline-flex w-full items-center rounded-lg px-3 py-1.5 text-sm/6 shadow-sm ring-1 ring-inset placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...rest}
    />
  )
)
Input.displayName = "Input"

export default Input
