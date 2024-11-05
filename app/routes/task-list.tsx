import type { CheckboxCheckedChangeDetails } from "@ark-ui/react"
import type { action, TasksLoaderData } from "~/routes/_layout._index"

import { Form, useFetcher, useNavigation } from "@remix-run/react"

import Button from "~/components/button"
import Checkbox from "~/components/checkbox"
import { Icons } from "~/components/icons"
import PendingButton from "~/components/pending-button"
import { useTaskList } from "~/lib/hooks/use-task-list"
import { cn } from "~/lib/utils"
import { TASK_INTENTS } from "~/lib/validations"

export default function TaskList() {
  const { tasks } = useTaskList()

  if (!tasks.length) {
    return <TaskListEmpty />
  }

  return (
    <ul className="grid grid-cols-1 gap-y-2.5">
      {tasks.map((item) => (
        <TaskListItem key={item.id} {...item} />
      ))}
      <TaskListEnd />
    </ul>
  )
}

function TaskListEmpty() {
  const navigation = useNavigation()
  const { filterParam } = useTaskList()

  const isPending = navigation.formData?.get("intent") === TASK_INTENTS.POPULATE_TASK

  return (
    <div className="space-y-4 py-10 text-center">
      <p className="text-center text-sm/6 text-gray-500">No tasks found. Add your first task!</p>
      {filterParam === "all" && (
        <Form method="POST">
          <PendingButton name="intent" value="populate-task" pending={isPending}>
            <Icons.listPlus className="mr-2 size-4" />
            Populate List
          </PendingButton>
        </Form>
      )}
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

function TaskListItem({ id, status, ...rest }: TasksLoaderData[number]) {
  const statusFetcher = useFetcher<typeof action>({ key: `status-${id}` })
  const deleteFetcher = useFetcher<typeof action>({ key: `delete-${id}` })

  if (statusFetcher.formData?.has("status")) {
    status = statusFetcher.formData.get("status") as TasksLoaderData[number]["status"]
  }

  const toggleError = statusFetcher.data ? ("error" in statusFetcher.data ? statusFetcher.data.error : null) : null
  const deleteError = deleteFetcher.data ? ("error" in deleteFetcher.data ? deleteFetcher.data.error : null) : null

  const anyError = toggleError ?? deleteError

  const task = { id, status, ...rest }

  return (
    <li className="relative isolate grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-0.5 rounded-lg border bg-white px-4 py-2.5 shadow-sm">
      <ToggleStatus {...task} />
      <p className={cn("col-start-2 text-sm/6 text-gray-950", status === "completed" && "line-through")}>{task.task}</p>
      <TaskDeleteButton {...task} />
      <span className="col-start-2 text-xs/6 text-gray-500">{task.relativeTime}</span>
      {anyError && (
        <div className="col-span-2 col-start-2">
          <p className="text-[0.8rem] font-medium text-red-600">{anyError}</p>
        </div>
      )}
    </li>
  )
}

function ToggleStatus(task: TasksLoaderData[number]) {
  const fetcher = useFetcher<typeof action>({ key: `status-${task.id}` })

  const onCheckedChange = ({ checked }: CheckboxCheckedChangeDetails) => {
    const formData = new FormData()
    formData.set("intent", TASK_INTENTS.STATUS_TASK)
    formData.set("id", task.id.toString())
    formData.set("status", checked ? "completed" : "pending")

    fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" })
  }

  return (
    <div className="pt-1">
      <Checkbox
        className="[&>div]:before:absolute [&>div]:before:-inset-3"
        checked={task.status === "completed"}
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
    <div className="w-4">
      <fetcher.Form method="POST" className="absolute right-1.5 top-1.5">
        <input type="hidden" name="id" value={task.id} />
        <Button variant={"ghost"} size={"icon"} name="intent" value={TASK_INTENTS.DELETE_TASK}>
          <Icons.trash className="size-4" />
        </Button>
      </fetcher.Form>
    </div>
  )
}
