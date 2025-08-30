import db from "@/drizzle/db"
import { users } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/dbCache"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export default async function getCurrentUser({ allData = false } = {}) {
    const { userId, redirectToSignIn } = await auth()
    return {
        userId,
        redirectToSignIn,
        user: allData && userId != null ? await getUser(userId) : undefined,
    }
}

async function getUser(id: string) {
    "use cache"
    cacheTag(getUserIdTag(id))
    return await db.query.users.findFirst({
        where: eq(users.id, id),
    })
}
