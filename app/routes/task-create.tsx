import type { action } from "~/routes/_layout._index"
import type React from "react"

import { useRef, useState } from "react"
import { Form, Link, useActionData, useSearchParams, useSubmit } from "@remix-run/react"
import { createId } from "@paralleldrive/cuid2"

import Button from "~/components/button"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import { useTaskList } from "~/lib/hooks/use-task-list"
import { cn, flattenZodFieldErrors, objectToFormData } from "~/lib/utils"
import { _optimisticTaskSchema, TASK_INTENTS } from "~/lib/validations"

export default function TaskCreateForm() {
  const submit = useSubmit()
  const actionData = useActionData<typeof action>()

  const inputRef = useRef<React.ElementRef<"input">>(null)
  const [optimisticError, setOptimisticError] = useState<string | null>(null)

  const actionError = actionData
    ? "error" in actionData
      ? actionData.error
      : "validations" in actionData
        ? actionData.validations?.task
        : null
    : null
  const anyError = optimisticError ?? actionError

  const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    setOptimisticError(null)

    let formData = new FormData(e.currentTarget)
    const id = createId()
    const parse = _optimisticTaskSchema.safeParse({ id, ...Object.fromEntries(formData.entries()) })

    if (!parse.success) {
      setOptimisticError(flattenZodFieldErrors(parse.error).task ?? null)
      return
    }

    formData = objectToFormData(parse.data, formData)
    submit(formData, { fetcherKey: `create-${id}`, method: "POST", navigate: false, flushSync: true })

    e.currentTarget.reset()
    inputRef.current?.focus()
  }

  return (
    <div className="sticky top-14 z-10 -mx-4">
      <div className="bg-gray-50 px-4 pt-6">
        <Form method="POST" onSubmit={onSubmitHandler}>
          <fieldset className="grid grid-cols-[1fr_auto] gap-2 sm:gap-3">
            <input type="hidden" name="intent" value={TASK_INTENTS.CREATE_TASK} />
            <div className="space-y-2">
              <Input
                ref={inputRef}
                name="task"
                placeholder="Refactor code to improve performance and readability"
                required
                autoFocus
              />
              {anyError && <p className="text-[0.8rem] font-medium text-red-600">{anyError}</p>}
            </div>
            <div>
              <Button type="submit" sm={"icon"}>
                <Icons.add className="size-4 sm:mr-2" />
                <span className="hidden sm:inline-block">Add to List</span>
              </Button>
            </div>
          </fieldset>
        </Form>
        <Filters />
      </div>
      <div className="h-6 bg-gradient-to-b from-gray-50 from-40%" />
    </div>
  )
}

function Filters() {
  return (
    <div className="mt-4 flex items-center gap-2">
      <FilterButton to="/" filter="all">
        All
      </FilterButton>
      <FilterButton to="/" filter="pending">
        Pending
      </FilterButton>
      <FilterButton to="/" filter="completed">
        Completed
      </FilterButton>
    </div>
  )
}

interface FilterButtonProps extends React.ComponentPropsWithoutRef<typeof Link> {
  filter: string
}

function FilterButton({ filter, to, className, ...rest }: FilterButtonProps) {
  const pathname = typeof to === "string" ? to : to.pathname
  const { filterParam } = useTaskList()
  const isActive = filterParam === filter

  const [searchParams] = useSearchParams()
  searchParams.set("filter", filter)

  return (
    <Link
      to={{ pathname, search: searchParams.toString() }}
      prefetch="intent"
      className={cn(
        "rounded-lg border bg-white px-2.5 py-1 text-sm/6 shadow-sm hover:border-border-150 hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isActive && "border-ring bg-gray-50 text-gray-950 hover:border-ring",
        className
      )}
      {...rest}
    />
  )
}
