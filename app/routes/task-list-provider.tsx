import type { _taskFilterParam } from "~/lib/validations"
import type { loader, TasksLoaderData } from "~/routes/_layout._index"
import type { z } from "zod"

import { useFetchers, useLoaderData } from "@remix-run/react"

import { TaskListContext } from "~/lib/hooks/use-task-list"
import { _optimisticTaskSchema, TASK_INTENTS } from "~/lib/validations"

export default function TaskListProvider({ children }: React.PropsWithChildren) {
  const { tasks: tasksRaw, filterParam } = useLoaderData<typeof loader>()
  const tasks = new Map<string, TasksLoaderData[number]>()

  const creates = usePendingCreates(filterParam)
  const deletes = usePendingDeletes()
  const status = usePendingStatus(filterParam)

  for (const task of [...tasksRaw, ...creates]) {
    tasks.set(task.id, task)
  }

  for (const id of [...deletes, ...status]) {
    tasks.delete(id)
  }

  return <TaskListContext.Provider value={{ tasks: [...tasks.values()], filterParam }}>{children}</TaskListContext.Provider>
}

function usePendingCreates(filter: z.infer<typeof _taskFilterParam>): TasksLoaderData {
  const fetchers = useFetchers()

  if (filter === "completed") {
    return []
  }

  return fetchers
    .filter((f) => f.formData?.get("intent") === TASK_INTENTS.CREATE_TASK)
    .map((f) => {
      return _optimisticTaskSchema.parse(Object.fromEntries(f.formData!.entries()))
    })
}

function usePendingDeletes(): string[] {
  return useFetchers()
    .filter((f) => f.formData?.get("intent") === TASK_INTENTS.DELETE_TASK)
    .map((f) => _optimisticTaskSchema.pick({ id: true }).parse(Object.fromEntries(f.formData!.entries())).id)
}

function usePendingStatus(filter: z.infer<typeof _taskFilterParam>): string[] {
  return useFetchers()
    .filter(
      (f) =>
        f.formData?.get("intent") === TASK_INTENTS.STATUS_TASK && (filter === "all" ? false : f.formData.get("status") !== filter)
    )
    .map((f) => _optimisticTaskSchema.pick({ id: true }).parse(Object.fromEntries(f.formData!.entries())).id)
}
