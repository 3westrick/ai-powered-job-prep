"use server"

import db from "@/drizzle/db"
import { users } from "@/drizzle/schema"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { eq } from "drizzle-orm"
import { getUserIdTag } from "./dbCache"

export async function getUser(userId: string) {
    "use cache"
    cacheTag(getUserIdTag(userId))
    return await db.query.users.findFirst({
        where: eq(users.id, userId),
    })
}
