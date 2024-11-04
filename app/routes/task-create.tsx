import type { action, TasksLoaderData } from "~/routes/_layout._index"

import { useRef, useState } from "react"
import { Form, useActionData, useSubmit } from "@remix-run/react"
import { createId } from "@paralleldrive/cuid2"

import Button from "~/components/button"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import { flattenZodFieldErrors, objectToFormData, timeAgo } from "~/lib/utils"
import { _createTaskSchema } from "~/lib/validations"

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

  return (
    <div className="sticky top-14 z-10 -mx-4 mb-3 bg-gray-50 px-4 pb-3 pt-6">
      <Form
        method="POST"
        onSubmit={(e) => {
          e.preventDefault()
          setOptimisticError(null)

          let formData = new FormData(e.currentTarget)
          const parse = _createTaskSchema.pick({ task: true }).safeParse(Object.fromEntries(formData.entries()))

          if (!parse.success) {
            setOptimisticError(flattenZodFieldErrors(parse.error).task ?? null)
            return
          }

          const recordId = createId()
          const values: TasksLoaderData[number] = {
            ...parse.data,
            id: recordId,
            status: "pending",
            relativeTime: timeAgo(new Date()),
          }
          formData = objectToFormData(values, formData)

          submit(formData, {
            fetcherKey: `create-${recordId}`,
            method: "POST",
            navigate: false,
            flushSync: true,
          })

          e.currentTarget.reset()
          inputRef.current?.focus()
        }}
      >
        <fieldset className="grid grid-cols-[1fr_auto] gap-2 sm:gap-3">
          <input type="hidden" name="intent" value="create-task" />
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
    </div>
  )
}
