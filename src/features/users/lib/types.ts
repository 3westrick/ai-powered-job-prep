import { users } from "@/drizzle/schema"

export type UserInsert = typeof users.$inferInsert
export type User = typeof users.$inferSelect
export type UserComponent = {
    name: string
    imageUrl: string
}
