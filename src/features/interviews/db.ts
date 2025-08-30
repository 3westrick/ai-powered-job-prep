import db from "@/drizzle/db"
import { InterviewInsert } from "./lib/types"
import { interviews } from "@/drizzle/schema"
import { revalidateInterviewCache } from "./dbCache"
import { eq } from "drizzle-orm"

export async function insertInterview(interview: InterviewInsert) {
    const [newInterview] = await db
        .insert(interviews)
        .values(interview)
        .returning({
            id: interviews.id,
            jobInfoId: interviews.jobInfoId,
        })
    revalidateInterviewCache({
        id: newInterview.id,
        jobInfoId: newInterview.jobInfoId,
    })
    return newInterview
}

export async function updateInterview(
    id: string,
    interview: Partial<InterviewInsert>
) {
    const [updatedInterview] = await db
        .update(interviews)
        .set(interview)
        .where(eq(interviews.id, id))
        .returning({
            id: interviews.id,
            jobInfoId: interviews.jobInfoId,
        })
    revalidateInterviewCache({
        id: updatedInterview.id,
        jobInfoId: updatedInterview.jobInfoId,
    })
    return updatedInterview
}
