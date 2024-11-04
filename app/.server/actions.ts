import { json } from "@remix-run/react"
import { count, eq } from "drizzle-orm"

import { db } from "~/.server/db"
import { tasksTable } from "~/.server/db/schema"
import { _createTaskSchema, _deleteTaskSchema, _toggleTaskSchema } from "~/.server/validations"
import { flattenZodFieldErrors } from "~/lib/utils"

export const createTaskAction = async (formData: FormData) => {
  const parse = _createTaskSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parse.success) {
    return json({ validations: flattenZodFieldErrors(parse.error) })
  }

  const [record] = await db.insert(tasksTable).values(parse.data).returning({ id: tasksTable.id })
  return json({ data: record?.id })
}

export const deleteTaskAction = async (formData: FormData) => {
  const parse = _deleteTaskSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parse.success) {
    return json({ error: "Bad request" })
  }

  await db.delete(tasksTable).where(eq(tasksTable.id, parse.data.id))
  return json({ data: parse.data.id })
}

export const toggleTaskAction = async (formData: FormData) => {
  const parse = _toggleTaskSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parse.success) {
    return json({ error: "Bad request" })
  }

  await db.update(tasksTable).set({ status: parse.data.status }).where(eq(tasksTable.id, parse.data.id))
  return json({ data: parse.data.id })
}

export const populateListAction = async () => {
  const tasks = [
    "Finish writing documentation",
    "Review and merge pull requests",
    "Set up CI/CD pipeline",
    "Refactor code for better performance",
    "Update project dependencies",
    "Optimize database queries",
    "Fix login page bug",
    "Implement user authentication",
    "Write unit tests for new module",
    "Deploy latest changes to staging",
    "Update API documentation",
    "Code review for team member",
    "Schedule team sync meeting",
    "Analyze application performance",
    "Research new tech stack options",
    "Set up monitoring for server",
    "Clean up unused code files",
    "Prepare slides for project update",
    "Conduct security audit",
    "Plan sprint tasks for next week",
  ].map((t) => ({ task: t }))

  const [records] = await db.select({ count: count() }).from(tasksTable)
  const recordsCount = records?.count ?? 0

  if (recordsCount > 0) {
    return json({ error: "Task list must be empty to complete this action" })
  }

  await db.insert(tasksTable).values(tasks)
  return json({ data: tasks.length })
}
