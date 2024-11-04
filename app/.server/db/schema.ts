import assert from "node:assert"

import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

import { tasksStatusEnum } from "~/lib/validations"

assert(process.env.DATABASE_PREFIX, "env: DATABASE_PREFIX missing!")

export const createTable = sqliteTableCreator((name) => `${process.env.DATABASE_PREFIX}${name}`)

export const tasksTable = createTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  task: text().notNull(),
  status: text({ enum: tasksStatusEnum }).notNull().default("pending"),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
