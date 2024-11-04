import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node"

import { data, isRouteErrorResponse, json, useRouteError } from "@remix-run/react"

import { createTaskAction, deleteTaskAction, populateListAction, toggleTaskAction } from "~/.server/actions"
import { db } from "~/.server/db"
import Alert from "~/components/alert"
import { omitKey, timeAgo } from "~/lib/utils"
import { _intentSchema, TASK_INTENTS } from "~/lib/validations"
import TaskCreateForm from "~/routes/task-create"
import TaskList from "~/routes/task-list"
import TaskListProvider from "~/routes/task-list-provider"

export type TasksLoaderData = SerializeFrom<typeof loader>["tasks"]
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
      case TASK_INTENTS.CREATE_TASK:
        return createTaskAction(formData)
      case TASK_INTENTS.DELETE_TASK:
        return deleteTaskAction(formData)
      case TASK_INTENTS.STATUS_TASK:
        return toggleTaskAction(formData)
      case TASK_INTENTS.POPULATE_TASK:
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
    <TaskListProvider>
      <div className="grid grid-cols-1 pb-20">
        <TaskCreateForm />
        <TaskList />
      </div>
    </TaskListProvider>
  )
}
