import { forwardRef } from "react"
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox"

import { cn } from "~/lib/utils"

const Checkbox = forwardRef<React.ElementRef<typeof ArkCheckbox.Root>, React.ComponentPropsWithoutRef<typeof ArkCheckbox.Root>>(
  ({ className, ...rest }, ref) => (
    <ArkCheckbox.Root ref={ref} className={cn("group", className)} {...rest}>
      <ArkCheckbox.Control className="relative size-4 rounded-full border border-border-150 hover:border-border-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-offset-2">
        <ArkCheckbox.Indicator className="absolute -inset-px rounded-full ring-4 ring-inset ring-gray-800" />
      </ArkCheckbox.Control>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  )
)
Checkbox.displayName = "Checkbox"

export default Checkbox
