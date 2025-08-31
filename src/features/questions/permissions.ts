import db from "@/drizzle/db"
import { interviews, jobInfos, questions } from "@/drizzle/schema"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import hasPermission from "@/services/clerk/lib/hasPermission"
import { and, count, eq, isNotNull } from "drizzle-orm"

export async function canCreateQuestion() {
    return await Promise.any([
        hasPermission("unlimited_questions").then(
            (bool) => bool || Promise.reject()
        ),
        Promise.all([
            hasPermission("5_questions"),
            getUserQuestionCount(),
        ]).then(([has, c]) => {
            if (has && c < 5) return true
            return Promise.reject()
        }),
    ]).catch(() => false)
}

async function getUserQuestionCount() {
    const { userId } = await getCurrentUser()
    if (userId == null) return 0
    return await getQuestionCount(userId)
}

async function getQuestionCount(userId: string) {
    const [{ count: c }] = await db
        .select({ count: count() })
        .from(questions)
        .innerJoin(questions, eq(questions.jobInfoId, jobInfos.id))
        .where(
            and(eq(jobInfos.userId, userId), isNotNull(interviews.humeChatId))
        )
    return c
}
