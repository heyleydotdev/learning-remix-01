import type { CheckboxCheckedChangeDetails } from "@ark-ui/react"
import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node"

import { createContext, useContext, useRef, useState } from "react"
import {
  data,
  Form,
  isRouteErrorResponse,
  json,
  useActionData,
  useFetcher,
  useFetchers,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSubmit,
} from "@remix-run/react"
import { createId } from "@paralleldrive/cuid2"

import { createTaskAction, deleteTaskAction, populateListAction, toggleTaskAction } from "~/.server/actions"
import { db } from "~/.server/db"
import Alert from "~/components/alert"
import Button from "~/components/button"
import Checkbox from "~/components/checkbox"
import { Icons } from "~/components/icons"
import Input from "~/components/input"
import PendingButton from "~/components/pending-button"
import { flattenZodFieldErrors, objectToFormData, omitKey, timeAgo } from "~/lib/utils"
import { _createTaskSchema, _intentSchema } from "~/lib/validations"

export async function loader() {
  const result = await db.query.tasksTable.findMany()
  const tasks = result.map((t) => ({
    ...omitKey(t, "createdAt"),
    relativeTime: timeAgo(t.createdAt),
  }))

  return data({ tasks })
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const intent = _intentSchema.parse(formData.get("intent"))

    switch (intent) {
      case "create-task":
        return createTaskAction(formData)
      case "delete-task":
        return deleteTaskAction(formData)
      case "status-task":
        return toggleTaskAction(formData)
      case "populate-task":
        return populateListAction()
      default:
        return json({ error: "Bad request" })
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("❌ [_index] Action:", error)
    }

    return json({ error: "An unexpected error occurred. Please refresh and try again." })
  }
}

type LoaderTasks = SerializeFrom<typeof loader>["tasks"]
type TasksListContextValues = { tasks: LoaderTasks }

const TasksListContext = createContext<TasksListContextValues>({} as TasksListContextValues)
const useTasksList = () => {
  const context = useContext(TasksListContext)
  if (!context) {
    throw new Error("useTasksList should be used within <TasksListProvider>")
  }
  return context
}

function TasksListProvider({ children }: React.PropsWithChildren) {
  const { tasks: tasksRaw } = useLoaderData<typeof loader>()
  const fetchers = useFetchers()

  const pendingTasks: LoaderTasks = fetchers
    .filter((f) => f.formData?.has("intent") && f.formData.get("intent") === "create-task")
    .map((f) => {
      return {
        id: String(f.formData?.get("id")),
        task: String(f.formData?.get("task")),
        status: String(f.formData?.get("status")) as LoaderTasks[number]["status"],
        relativeTime: String(f.formData?.get("relativeTime")),
      }
    })

  const tasks = new Map<string, LoaderTasks[number]>()
  for (const task of [...tasksRaw, ...pendingTasks]) {
    tasks.set(task.id, task)
  }

  return <TasksListContext.Provider value={{ tasks: [...tasks.values()] }}>{children}</TasksListContext.Provider>
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
    <TasksListProvider>
      <div className="grid grid-cols-1 pb-20">
        <CreateForm />
        <TasksList />
      </div>
    </TasksListProvider>
  )
}

function CreateForm() {
  const submit = useSubmit()
  const actionData = useActionData<typeof action>()
  const formRef = useRef<React.ElementRef<typeof Form>>(null)
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
        ref={formRef}
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
          const values: LoaderTasks[number] = {
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

          formRef.current?.reset()
        }}
      >
        <fieldset className="grid grid-cols-[1fr_auto] gap-2 sm:gap-3">
          <input type="hidden" name="intent" value="create-task" />
          <div className="space-y-2">
            <Input name="task" placeholder="Refactor code to improve performance and readability" required autoFocus />
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

function TasksList() {
  const { tasks } = useTasksList()

  if (!tasks.length) {
    return <TaskListEmpty />
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

type TasksListItemProps = SerializeFrom<typeof loader>["tasks"][number]

function TasksListItem(task: TasksListItemProps) {
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

function ToggleStatus(task: TasksListItemProps) {
  let status = task.status
  const fetcher = useFetcher<typeof action>({ key: `status-${task.id}` })

  if (fetcher.formData?.has("status")) {
    status = fetcher.formData.get("status") as TasksListItemProps["status"]
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

function TaskDeleteButton(task: TasksListItemProps) {
  const fetcher = useFetcher<typeof action>({ key: `delete-${task.id}` })

  return (
    <fetcher.Form method="POST" className="absolute right-1 top-1 hidden group-hover:inline-flex">
      <input type="hidden" name="id" value={task.id} />
      <PendingButton variant={"secondary"} size={"icon"} name="intent" value="delete-task" pending={fetcher.state !== "idle"}>
        <Icons.trash className="size-4" />
      </PendingButton>
    </fetcher.Form>
  )
}

function TaskListEnd() {
  const { tasks } = useTasksList()

  if (tasks.length < 10) {
    return null
  }

  return (
    <li className="py-8">
      <p className="text-center text-xs/6 text-gray-500">All caught up! No more tasks ahead.</p>
    </li>
  )
}
