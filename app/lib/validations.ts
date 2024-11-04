import { isCuid } from "@paralleldrive/cuid2"
import { z } from "zod"

export enum TASK_INTENTS {
  CREATE_TASK = "create-task",
  DELETE_TASK = "delete-task",
  STATUS_TASK = "status-task",
  POPULATE_TASK = "populate-task",
}

export const _intentSchema = z.nativeEnum(TASK_INTENTS)

export const _cuidSchema = z.string().refine((s) => isCuid(s))

export const _createTaskSchema = z.object({
  id: _cuidSchema,
  task: z.string().min(5, "Must contain at least 5 character(s)").max(200, { message: "Must contain at most 200 character(s)" }),
})

export const _deleteTaskSchema = z.object({ id: _cuidSchema })

export const tasksStatusEnum = ["pending", "completed"] as const
export const _toggleTaskSchema = z.object({
  id: _cuidSchema,
  status: z.enum(tasksStatusEnum),
})
