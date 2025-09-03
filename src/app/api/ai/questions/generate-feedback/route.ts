import db from "@/drizzle/db"
import { questions } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { getQuestion } from "@/features/questions/actions"
import { getQuestionIdTag } from "@/features/questions/dbCache"
import { generateAiQuestionFeedback } from "@/services/ai/questions"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import z from "zod"

const schema = z.object({
    prompt: z.string().min(1),
    questionId: z.string().min(1),
})
export async function POST(req: Request) {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
        return new Response("Error generating feedback", { status: 400 })
    }
    const { prompt: answer, questionId } = result.data
    const { userId } = await getCurrentUser()

    if (userId == null) {
        return new Response("You are not logged in", { status: 401 })
    }

    const question = await getQuestion(questionId, userId)
    if (question == null) {
        return new Response("You don't have permission to do this", {
            status: 403,
        })
    }

    const res = generateAiQuestionFeedback({
        question: question.text,
        answer,
    })

    return res.toDataStreamResponse({
        sendUsage: false,
    })
}
