import { json } from "@remix-run/react"
import { eq } from "drizzle-orm"

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
