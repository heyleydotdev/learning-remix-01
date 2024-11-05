import type { _taskFilterParam } from "~/lib/validations"
import type { TasksLoaderData } from "~/routes/_layout._index"
import type { z } from "zod"

import { createContext, useContext } from "react"

export type TasksListContextValues = {
  tasks: TasksLoaderData
  filterParam: z.infer<typeof _taskFilterParam>
}

export const TaskListContext = createContext<TasksListContextValues>({} as TasksListContextValues)

export const useTaskList = () => {
  const context = useContext(TaskListContext)
  if (!context) {
    throw new Error("useTaskList should be used within <TaskListProvider>")
  }
  return context
}
