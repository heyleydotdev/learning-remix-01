import { forwardRef } from "react"

import { cn } from "~/lib/utils"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = forwardRef<React.ElementRef<"button">, ButtonProps>(({ className, ...rest }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg bg-gray-800 px-3 py-1.5 text-center text-sm/6 text-white shadow-sm transition-[background-color] hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
      className
    )}
    {...rest}
  />
))
Button.displayName = "Button"

export default Button
