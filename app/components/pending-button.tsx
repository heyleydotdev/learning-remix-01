import type { ButtonProps } from "~/components/button"

import { forwardRef } from "react"

import Button from "~/components/button"
import Spinner from "~/components/spinner"
import { cn } from "~/lib/utils"

export interface PendingButtonProps extends ButtonProps {
  pending: boolean
}

const PendingButton = forwardRef<React.ElementRef<typeof Button>, PendingButtonProps>(
  ({ pending, children, className, disabled, ...rest }, ref) => (
    <Button ref={ref} className={cn("group relative", className)} data-pending={pending} disabled={pending || disabled} {...rest}>
      {pending && <Spinner className="absolute size-4" />}
      <span className="contents group-data-[pending=true]:invisible">{children}</span>
    </Button>
  )
)
PendingButton.displayName = "Button"

export default PendingButton
