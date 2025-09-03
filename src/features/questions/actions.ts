"use server"

import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getQuestionIdTag } from "./dbCache"
import db from "@/drizzle/db"
import { and, desc, eq } from "drizzle-orm"
import { questions } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { getJobInfo } from "../jobInfos/actions"
import { Question } from "./lib/types"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"

export async function getQuestion(questionId: string, userId: string) {
    "use cache"
    cacheTag(getQuestionIdTag(questionId))
    const question = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
        with: {
            jobInfo: {
                columns: {
                    id: true,
                    userId: true,
                },
            },
        },
    })
    if (question == null) return null
    cacheTag(getJobInfoIdTag(question.jobInfoId))

    if (question.jobInfo.userId !== userId) return null
    return question
}

export async function lastQuestionByJobInfoId(
    jobInfoId: string
): Promise<
    { error: true; message: string } | { error: false; question: Question }
> {
    const { userId } = await getCurrentUser()
    if (userId == null)
        return {
            error: true,
            message: "You are not logged in",
        }
    const question = await db.query.questions.findFirst({
        where: eq(questions.jobInfoId, jobInfoId),
        orderBy: desc(questions.createdAt),
        with: {
            jobInfo: {
                columns: {
                    userId: true,
                },
            },
        },
    })
    if (question == null)
        return {
            error: true,
            message: "No question found",
        }
    if (question.jobInfo.userId !== userId)
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    return {
        error: false,
        question,
    }
}
