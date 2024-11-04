import { isCuid } from "@paralleldrive/cuid2"
import { z } from "zod"

export const _intentSchema = z.enum(["create-task", "delete-task", "status-task", "populate-task"])

export const _cuidSchema = z.string().refine((s) => isCuid(s))

export const _createTaskSchema = z.object({
  id: _cuidSchema,
  task: z.string().min(5, "Must contain at least 5 character(s)"),
})

export const _deleteTaskSchema = z.object({ id: _cuidSchema })

export const tasksStatusEnum = ["pending", "completed"] as const
export const _toggleTaskSchema = z.object({
  id: _cuidSchema,
  status: z.enum(tasksStatusEnum),
})
