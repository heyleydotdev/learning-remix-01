import type { CheckboxCheckedChangeDetails } from "@ark-ui/react"
import type { action, TasksLoaderData } from "~/routes/_layout._index"

import { Form, useFetcher, useNavigation } from "@remix-run/react"

import Button from "~/components/button"
import Checkbox from "~/components/checkbox"
import { Icons } from "~/components/icons"
import PendingButton from "~/components/pending-button"
import { useTaskList } from "~/routes/task-list-provider"

export default function TaskList() {
  const { tasks } = useTaskList()

  if (!tasks.length) {
    return <TaskListEmpty />
  }

  return (
    <ul className="grid grid-cols-1 gap-y-3">
      {tasks.map((item) => (
        <TaskListItem key={item.id} {...item} />
      ))}
      <TaskListEnd />
    </ul>
  )
}

function TaskListEmpty() {
  const navigation = useNavigation()
  const isPending = navigation.formData?.get("intent") === "populate-task"

  return (
    <div className="space-y-4 py-10 text-center">
      <p className="text-center text-sm/6 text-gray-500">No tasks found. Add your first task!</p>
      <Form method="POST">
        <PendingButton name="intent" value="populate-task" pending={isPending}>
          <Icons.listPlus className="mr-2 size-4" />
          Populate List
        </PendingButton>
      </Form>
    </div>
  )
}

function TaskListEnd() {
  const { tasks } = useTaskList()

  if (tasks.length < 10) {
    return null
  }

  return (
    <li className="py-8">
      <p className="text-center text-xs/6 text-gray-500">All caught up! No more tasks ahead.</p>
    </li>
  )
}

function TaskListItem(task: TasksLoaderData[number]) {
  const toggleStatusFetcher = useFetcher<typeof action>({ key: `status-${task.id}` })
  const deleteFetcher = useFetcher<typeof action>({ key: `delete-${task.id}` })

  const toggleError = toggleStatusFetcher.data
    ? "error" in toggleStatusFetcher.data
      ? toggleStatusFetcher.data.error
      : null
    : null
  const deleteError = deleteFetcher.data ? ("error" in deleteFetcher.data ? deleteFetcher.data.error : null) : null

  const anyError = toggleError ?? deleteError

  return (
    <li className="group relative isolate grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 rounded-lg border bg-white px-4 py-2.5 shadow-sm sm:grid-cols-[auto_1fr_auto]">
      <ToggleStatus {...task} />
      <p className="text-sm/6 text-gray-950">{task.task}</p>
      <span className="col-start-2 text-xs/6 text-gray-500 sm:col-start-3">{task.relativeTime}</span>
      {anyError && (
        <div className="col-span-2 col-start-2">
          <p className="text-[0.8rem] font-medium text-red-600">{anyError}</p>
        </div>
      )}
      <TaskDeleteButton {...task} />
    </li>
  )
}

function ToggleStatus(task: TasksLoaderData[number]) {
  let status = task.status
  const fetcher = useFetcher<typeof action>({ key: `status-${task.id}` })

  if (fetcher.formData?.has("status")) {
    status = fetcher.formData.get("status") as TasksLoaderData[number]["status"]
  }

  const onCheckedChange = ({ checked }: CheckboxCheckedChangeDetails) => {
    const formData = new FormData()
    formData.set("intent", "status-task")
    formData.set("id", task.id.toString())
    formData.set("status", checked ? "completed" : "pending")

    fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" })
  }

  return (
    <div className="pt-1">
      <Checkbox
        className="[&>div]:before:absolute [&>div]:before:-inset-3"
        checked={status === "completed"}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}

function TaskDeleteButton(task: TasksLoaderData[number]) {
  const fetcher = useFetcher<typeof action>({
    key: `delete-${task.id}`,
  })

  return (
    <fetcher.Form method="POST" className="absolute right-1 top-1 hidden group-hover:inline-flex">
      <input type="hidden" name="id" value={task.id} />
      <Button variant={"secondary"} size={"icon"} name="intent" value="delete-task">
        <Icons.trash className="size-4" />
      </Button>
    </fetcher.Form>
  )
}
