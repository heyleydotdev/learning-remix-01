import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node"

import { useEffect, useRef } from "react"
import { data, Form, json, useLoaderData, useNavigation } from "@remix-run/react"
import { z } from "zod"

import { db } from "~/.server/db"
import { tasksTable } from "~/.server/db/schema"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import PendingButton from "~/components/pending-button"
import { timeAgo } from "~/lib/utils"

export async function loader() {
  const tasks = await db.query.tasksTable.findMany()

  return data({ tasks })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = z.object({ task: z.string().min(1) }).parse(Object.fromEntries(formData.entries()))

  await db.insert(tasksTable).values(data)

  return json({ success: true })
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
    </ul>
  )
}

function TasksListItem(task: SerializeFrom<typeof loader>["tasks"][number]) {
  return (
    <li className="grid grid-cols-1 gap-x-4 gap-y-0.5 rounded-lg border bg-white px-4 py-2.5 shadow-sm sm:grid-cols-[1fr_auto]">
      <p className="text-sm/6 text-gray-950">{task.task}</p>
      <span className="text-xs/6 text-gray-500">{timeAgo(task.createdAt)}</span>
    </li>
  )
}
