import assert from "node:assert"

import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core"

assert(process.env.DATABASE_PREFIX, "env: DATABASE_PREFIX missing!")

export const createTable = sqliteTableCreator((name) => `${process.env.DATABASE_PREFIX}${name}`)

export const tasksTable = createTable("tasks", {
  id: integer().primaryKey({ autoIncrement: true }),
  task: text().notNull(),
  status: text({ enum: ["pending", "completed"] })
    .notNull()
    .default("pending"),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
