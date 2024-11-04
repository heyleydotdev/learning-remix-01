import { z } from "zod"

export const _intentSchema = z.enum(["create-task", "delete-task", "status-task", "populate-task"])

export const _createTaskSchema = z.object({ task: z.string().min(5, "Must contain at least 5 character(s)") })
export const _deleteTaskSchema = z.object({
  id: z
    .string()
    .min(1)
    .transform((s) => parseInt(s, 10)),
})
export const _toggleTaskSchema = z.object({
  id: _deleteTaskSchema.shape.id,
  status: z.enum(["on", "off"]).transform((s) => (s === "on" ? "completed" : "pending")),
})
