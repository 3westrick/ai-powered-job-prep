import { questions } from "@/drizzle/schema"
import { QuestionInsert } from "./lib/types"
import db from "@/drizzle/db"
import { revalidateQuestionCache } from "./dbCache"

export async function insertQuestion(question: QuestionInsert) {
    const [newQuestion] = await db
        .insert(questions)
        .values(question)
        .returning({
            id: questions.id,
            jobInfoId: questions.jobInfoId,
        })

    revalidateQuestionCache({
        id: newQuestion.id,
        jobInfoId: newQuestion.jobInfoId,
    })

    return newQuestion
}
