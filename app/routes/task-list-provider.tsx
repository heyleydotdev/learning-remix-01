import type { loader, TasksLoaderData } from "~/routes/_layout._index"

import { createContext, useContext } from "react"
import { useFetchers, useLoaderData } from "@remix-run/react"

export type TasksListContextValues = {
  tasks: TasksLoaderData
}

const TaskListContext = createContext<TasksListContextValues>({} as TasksListContextValues)

export const useTaskList = () => {
  const context = useContext(TaskListContext)
  if (!context) {
    throw new Error("useTaskList should be used within <TaskListProvider>")
  }
  return context
}

export default function TaskListProvider({ children }: React.PropsWithChildren) {
  const { tasks: tasksRaw } = useLoaderData<typeof loader>()
  const fetchers = useFetchers()

  const pendingCreates: TasksLoaderData = fetchers
    .filter((f) => f.formData?.has("intent") && f.formData.get("intent") === "create-task")
    .map((f) => {
      return {
        id: String(f.formData?.get("id")),
        task: String(f.formData?.get("task")),
        status: String(f.formData?.get("status")) as TasksLoaderData[number]["status"],
        relativeTime: String(f.formData?.get("relativeTime")),
      }
    })

  const pendingDeletes: string[] = fetchers
    .filter((f) => f.formData?.has("intent") && f.formData.get("intent") === "delete-task")
    .map((f) => String(f.formData?.get("id")))

  const tasks = new Map<string, TasksLoaderData[number]>()
  for (const task of [...tasksRaw, ...pendingCreates]) {
    tasks.set(task.id, task)
  }

  for (const id of pendingDeletes) {
    tasks.delete(id)
  }

  return <TaskListContext.Provider value={{ tasks: [...tasks.values()] }}>{children}</TaskListContext.Provider>
}
