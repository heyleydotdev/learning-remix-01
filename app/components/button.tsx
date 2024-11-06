import type { VariantProps } from "class-variance-authority"

import { forwardRef } from "react"
import { cva } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-lg text-center text-sm/6 shadow-sm transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
    "[--d-px:theme(spacing[3])] [--d-py:theme(spacing[1.5])] [--i-p:theme(spacing[1.5])] [--i-size:theme(spacing[9])]",
  ],
  {
    variants: {
      variant: {
        default: "bg-gray-800 text-white hover:bg-gray-700",
        secondary: "bg-gray-50 text-gray-950 hover:bg-gray-100",
        ghost: "bg-transparent text-gray-950 shadow-none hover:bg-gray-100",
      },
      size: {
        default: "px-[--d-px] py-[--d-py]",
        icon: "size-[--i-size] px-[--i-p] py-[--i-p]",
      },
      sm: {
        icon: "max-sm:size-[--i-size] max-sm:px-[--i-p] max-sm:py-[--i-p]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

const Button = forwardRef<React.ElementRef<"button">, ButtonProps>(({ className, variant, size, sm, ...rest }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, sm }), className)} {...rest} />
))
Button.displayName = "Button"

export default Button
