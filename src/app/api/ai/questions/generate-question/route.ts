import db from "@/drizzle/db"
import { questionDifficulties, questions } from "@/drizzle/schema"
import { getJobInfo } from "@/features/jobInfos/actions"
import { insertQuestion } from "@/features/questions/db"
import { getQuestionJobInfoTag } from "@/features/questions/dbCache"
import { canCreateQuestion } from "@/features/questions/permissions"
import { PLAN_LIMIT } from "@/lib/errorToast"
import { generateAiQuestion } from "@/services/ai/questions"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { createDataStreamResponse } from "ai"
import { asc, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import z from "zod"

export const maxDuration = 180

const schema = z.object({
    prompt: z.enum(questionDifficulties),
    jobInfoId: z.string().min(1),
})
export async function POST(req: Request) {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
        return new Response("Error generating question", { status: 400 })
    }
    const { prompt: difficulty, jobInfoId } = result.data
    const { userId } = await getCurrentUser()

    if (userId == null) {
        return new Response("You are not logged in", { status: 401 })
    }
    if (!(await canCreateQuestion())) {
        return new Response(PLAN_LIMIT, {
            status: 403,
        })
    }

    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (jobInfo == null) {
        return new Response("You don't have permission to do this", {
            status: 403,
        })
    }

    const previousQuestions = await getQuestions(jobInfoId, userId)

    try {
        return createDataStreamResponse({
            execute: async (dataStream) => {
                console.log("before generating question")
                const res = generateAiQuestion({
                    previousQuestions,
                    jobInfo,
                    difficulty,
                    onFinish: async (question) => {
                        console.log("after generating question")
                        const { id } = await insertQuestion({
                            text: question,
                            jobInfoId,
                            difficulty,
                        })

                        dataStream.writeData({ questionId: id })
                    },
                })
                console.log("before merging into data stream")
                return res.mergeIntoDataStream(dataStream, { sendUsage: false })
            },
        })
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return new Response("Error generating question", { status: 500 })
    }
}

async function getQuestions(jobInfoId: string, userId: string) {
    "use cache"
    cacheTag(getQuestionJobInfoTag(jobInfoId))
    return await db.query.questions.findMany({
        where: eq(questions.jobInfoId, jobInfoId),
        orderBy: asc(questions.createdAt),
    })
}
