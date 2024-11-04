import type { CheckboxCheckedChangeDetails } from "@ark-ui/react"
import type { ActionFunctionArgs, SerializeFrom, TypedResponse } from "@remix-run/node"

import { useEffect, useRef } from "react"
import {
  data,
  Form,
  isRouteErrorResponse,
  json,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z, ZodError } from "zod"

import { db } from "~/.server/db"
import { tasksTable } from "~/.server/db/schema"
import Alert from "~/components/alert"
import Checkbox from "~/components/checkbox"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import PendingButton from "~/components/pending-button"
import { flattenZodFieldErrors, timeAgo } from "~/lib/utils"

export async function loader() {
  const result = await db.query.tasksTable.findMany()
  const tasks = result.map((t) => ({ ...t, relativeTime: timeAgo(t.createdAt) }))

  return data({ tasks })
}

type ActionResult =
  | {
      success: true
    }
  | {
      success: false
      error?: string
      validations?: Record<string, string>
    }

export async function action({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResult>> {
  try {
    const schema = z.union([
      z.object({
        intent: z.literal("create-task", { message: "Invalid intent" }),
        task: z.string().min(5, "Must contain at least 5 character(s)"),
      }),
      z.object({
        intent: z.literal("toggle-status", { message: "Invalid intent" }),
        id: z
          .string()
          .min(1)
          .transform((s) => parseInt(s, 10)),
        status: z.enum(["on", "off"]).transform((s) => (s === "on" ? "completed" : "pending")),
      }),
    ])
    const formData = await request.formData()
    const data = schema.parse(Object.fromEntries(formData.entries()))

    switch (data.intent) {
      case "create-task":
        await db.insert(tasksTable).values(data)
        return json({ success: true })
      case "toggle-status":
        await db.update(tasksTable).set({ status: data.status }).where(eq(tasksTable.id, data.id))
        return json({ success: true })
      default:
        return json({ success: true })
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return json({
        success: false,
        validations: flattenZodFieldErrors(error),
      })
    }
    return json({
      success: false,
      error: "An unexpected error occurred. Please refresh and try again.",
    })
  }
}

export function ErrorBoundary() {
  const error = useRouteError()
  const errorMessage = isRouteErrorResponse(error)
    ? String(error.data)
    : "An unexpected error occurred. Please refresh and try again."

  return (
    <div className="pt-6">
      <Alert>{errorMessage}</Alert>
    </div>
  )
}

export default function Index() {
  return (
    <div className="grid grid-cols-1 pb-20">
      <CreateForm />
      <TasksList />
    </div>
  )
}

function CreateForm() {
  const navigation = useNavigation()
  const actionData = useActionData<typeof action>()
  const isCreating = navigation.formData?.get("intent") === "create-task"
  const anyError = actionData?.success == false && (actionData.error ?? actionData.validations?.task)

  const formRef = useRef<React.ElementRef<typeof Form>>(null)

  useEffect(() => {
    if (!isCreating && actionData?.success) {
      formRef.current?.reset()
    }
  }, [actionData?.success, isCreating])

  return (
    <div className="sticky top-14 z-10 -mx-4 mb-3 bg-gray-50 px-4 pb-3 pt-6">
      <Form ref={formRef} method="POST">
        <fieldset className="grid grid-cols-[1fr_auto] gap-2 sm:gap-3" disabled={isCreating}>
          <div className="space-y-2">
            <Input name="task" placeholder="Refactor code to improve performance and readability" required autoFocus />
            {anyError && <p className="text-[0.8rem] font-medium text-red-600">{anyError}</p>}
          </div>
          <div>
            <PendingButton type="submit" name="intent" value="create-task" pending={isCreating}>
              <Icons.add className="size-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Add to List</span>
            </PendingButton>
          </div>
        </fieldset>
      </Form>
    </div>
  )
}

function TasksList() {
  const { tasks } = useLoaderData<typeof loader>()

  if (!tasks.length) {
    return (
      <div className="py-10">
        <p className="text-center text-sm/6 text-gray-500">No tasks found. Add your first task!</p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-y-3">
      {tasks.map((item) => (
        <TasksListItem key={item.id} {...item} />
      ))}
      <TaskListEnd />
    </ul>
  )
}

function TasksListItem(task: SerializeFrom<typeof loader>["tasks"][number]) {
  const fetcher = useFetcher<typeof action>()
  const anyError = fetcher.data?.success == false && (fetcher.data.error ?? fetcher.data.validations?.task)

  const onChangeStatus = ({ checked }: CheckboxCheckedChangeDetails) => {
    const formData = new FormData()
    formData.set("intent", "toggle-status")
    formData.set("id", task.id.toString())
    formData.set("status", checked ? "on" : "off")

    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    })
  }

  return (
    <li className="isolate grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 rounded-lg border bg-white px-4 py-2.5 shadow-sm sm:grid-cols-[auto_1fr_auto]">
      <div className="pt-1">
        <Checkbox
          className="[&>div]:before:absolute [&>div]:before:-inset-3"
          checked={task.status === "completed"}
          onCheckedChange={onChangeStatus}
          disabled={fetcher.state !== "idle"}
        />
      </div>
      <p className="text-sm/6 text-gray-950">{task.task}</p>
      <span className="col-start-2 text-xs/6 text-gray-500 sm:col-start-3">{task.relativeTime}</span>

      <div className="col-span-2 col-start-2">
        {anyError && <p className="text-[0.8rem] font-medium text-red-600">{anyError}</p>}
      </div>
    </li>
  )
}

function TaskListEnd() {
  const { tasks } = useLoaderData<typeof loader>()

  if (tasks.length < 10) {
    return null
  }

  return (
    <li className="py-8">
      <p className="text-center text-xs/6 text-gray-500">All caught up! No more tasks ahead.</p>
    </li>
  )
}
