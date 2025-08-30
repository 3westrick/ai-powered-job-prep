import db from "@/drizzle/db"
import { interviews, jobInfos } from "@/drizzle/schema"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import hasPermission from "@/services/clerk/lib/hasPermission"
import { and, count, eq, isNotNull } from "drizzle-orm"

export async function canCreateInterview() {
    return await Promise.any([
        hasPermission("unlimited_interviews").then(
            (bool) => bool || Promise.reject()
        ),
        Promise.all([
            hasPermission("1_interview"),
            getUserInterviewCount(),
        ]).then(([has, c]) => {
            if (has && c < 1) return true
            return Promise.reject()
        }),
    ]).catch(() => false)
}

async function getUserInterviewCount() {
    const { userId } = await getCurrentUser()
    if (userId == null) return 0
    return await getInterviewCount(userId)
}

async function getInterviewCount(userId: string) {
    const [{ count: c }] = await db
        .select({ count: count() })
        .from(interviews)
        .innerJoin(interviews, eq(interviews.jobInfoId, jobInfos.id))
        .where(
            and(eq(jobInfos.userId, userId), isNotNull(interviews.humeChatId))
        )
    return c
}
