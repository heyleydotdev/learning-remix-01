import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node"

import { useEffect, useRef } from "react"
import { data, Form, json, useFetcher, useLoaderData, useNavigation } from "@remix-run/react"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "~/.server/db"
import { tasksTable } from "~/.server/db/schema"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import PendingButton from "~/components/pending-button"
import { timeAgo } from "~/lib/utils"

export async function loader() {
  const result = await db.query.tasksTable.findMany()
  const tasks = result.map((t) => ({ ...t, relativeTime: timeAgo(t.createdAt) }))

  return data({ tasks })
}

export async function action({ request }: ActionFunctionArgs) {
  const schema = z.union([
    z.object({ intent: z.literal("create-task"), task: z.string().min(1) }),
    z.object({
      intent: z.literal("toggle-status"),
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
      return json({ success: false })
  }
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
  const isCreating = navigation.formData?.get("intent") === "create-task"

  const formRef = useRef<React.ElementRef<typeof Form>>(null)

  useEffect(() => {
    if (!isCreating) {
      formRef.current?.reset()
    }
  }, [isCreating])

  return (
    <div className="sticky top-14 -mx-4 mb-3 bg-gray-50 px-4 pb-3 pt-6">
      <Form ref={formRef} method="POST">
        <fieldset className="grid grid-cols-[1fr_auto] gap-2 sm:gap-3" disabled={isCreating}>
          <Input name="task" placeholder="Refactor code to improve performance and readability" required autoFocus />
          <PendingButton type="submit" name="intent" value="create-task" pending={isCreating}>
            <Icons.add className="size-4 sm:mr-2" />
            <span className="hidden sm:inline-block">Add to List</span>
          </PendingButton>
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
  const fetcher = useFetcher()

  const onChangeStatus: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const formData = new FormData()
    formData.set("intent", "toggle-status")
    formData.set("id", task.id.toString())
    formData.set("status", e.target.checked ? "on" : "off")

    fetcher.submit(formData, {
      encType: "multipart/form-data",
      method: "POST",
    })
  }

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 rounded-lg border bg-white px-4 py-2.5 shadow-sm sm:grid-cols-[auto_1fr_auto]">
      <input
        type="checkbox"
        className="mt-1 size-4 rounded-lg border-border accent-green-400"
        checked={task.status === "completed"}
        onChange={onChangeStatus}
        disabled={fetcher.state !== "idle"}
      />
      <p className="text-sm/6 text-gray-950">{task.task}</p>
      <span className="col-start-2 text-xs/6 text-gray-500">{task.relativeTime}</span>
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
