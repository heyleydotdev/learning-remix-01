import type { loader, TasksLoaderData } from "~/routes/_layout._index"

import { useFetchers, useLoaderData, useSearchParams } from "@remix-run/react"

import { TaskListContext } from "~/lib/hooks/use-task-list"
import { _taskFilterParam, TASK_INTENTS } from "~/lib/validations"

export default function TaskListProvider({ children }: React.PropsWithChildren) {
  const { tasks: tasksRaw } = useLoaderData<typeof loader>()
  const fetchers = useFetchers()

  const [searchParams] = useSearchParams()
  const filterParam = _taskFilterParam.parse(searchParams.get("filter"))

  const pendingCreates: TasksLoaderData =
    filterParam !== "completed"
      ? fetchers
          .filter((f) => f.formData?.get("intent") === TASK_INTENTS.CREATE_TASK)
          .map((f) => {
            return {
              id: String(f.formData?.get("id")),
              task: String(f.formData?.get("task")),
              status: String(f.formData?.get("status")) as TasksLoaderData[number]["status"],
              relativeTime: String(f.formData?.get("relativeTime")),
            }
          })
      : []

  const pendingDeletes: string[] = fetchers
    .filter((f) => f.formData?.get("intent") === TASK_INTENTS.DELETE_TASK)
    .map((f) => String(f.formData?.get("id")))

  const pendingStatus: string[] = fetchers
    .filter(
      (f) =>
        f.formData?.get("intent") === TASK_INTENTS.STATUS_TASK &&
        (filterParam === "all" ? false : f.formData.get("status") !== filterParam)
    )
    .map((f) => String(f.formData?.get("id")))

  const tasks = new Map<string, TasksLoaderData[number]>()
  for (const task of [...tasksRaw, ...pendingCreates]) {
    tasks.set(task.id, task)
  }

  for (const id of [...pendingDeletes, ...pendingStatus]) {
    tasks.delete(id)
  }

  return <TaskListContext.Provider value={{ tasks: [...tasks.values()], filterParam }}>{children}</TaskListContext.Provider>
}
