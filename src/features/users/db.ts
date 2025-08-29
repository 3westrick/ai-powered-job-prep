import db from "@/drizzle/db"
import { users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { UserInsert } from "./lib/types"

export async function upsertUser(user: UserInsert) {
    await db
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
            target: [users.id],
            set: user,
        })
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id))
}
