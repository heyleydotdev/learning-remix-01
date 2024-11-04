import type { VariantProps } from "class-variance-authority"

import { useId } from "react"
import { cva } from "class-variance-authority"

import { Icons } from "~/components/icons"
import { cn } from "~/lib/utils"

type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "role"> & VariantProps<typeof alertVariants>

const alertVariants = cva("flex space-x-3 rounded-lg", {
  variants: {
    variant: {
      success: "bg-green-50 text-green-700",
      danger: "bg-red-50 text-red-700",
    },
    size: {
      default: "p-4 text-sm",
    },
  },
  defaultVariants: {
    variant: "danger",
    size: "default",
  },
})

const ALERT_ICONS = {
  success: "badgeCheck",
  danger: "circleX",
} satisfies Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, keyof typeof Icons>

export default function Alert({ className, children, variant, size, ...rest }: AlertProps) {
  const id = useId()
  const Icon = Icons[ALERT_ICONS[variant ?? "danger"]]

  return (
    <div className={cn(alertVariants({ variant, size }), className)} role="alert" aria-labelledby={id} {...rest}>
      <Icon className="mt-0.5 size-4 flex-shrink-0" />
      <span id={id} className="flex-1 text-pretty">
        {children}
      </span>
    </div>
  )
}
