import { varchar } from "drizzle-orm/pg-core"
import { createdAt, createTable, updatedAt } from "../schemaHelper"

export const users = createTable("users", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    email: varchar().notNull().unique(),
    imageUrl: varchar().notNull(),
    createdAt,
    updatedAt,
})
