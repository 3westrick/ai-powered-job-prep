"use server"

import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { getJobInfo } from "../jobInfos/actions"
import { insertInterview, updateInterview as updateInterviewDB } from "./db"
import { InterviewInsert } from "./lib/types"
import { getInterviewIdTag } from "./dbCache"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import db from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { interviews } from "@/drizzle/schema"
import { getJobInfoIdTag } from "../jobInfos/dbCache"

export async function createInterview(
    jobInfoId: string
): Promise<{ error: true; message: string } | { error: false; id: string }> {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }

    // permissions

    // rate limit

    // job info
    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (jobInfo == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }
    // create interview
    const interview = await insertInterview({
        jobInfoId,
        duration: "00:00:00",
        humeChatId: "",
        feedback: "",
    })

    return { error: false, id: interview.id }
}

export async function updateInterview(
    id: string,
    data: {
        humeChatId?: string
        duration?: string
    }
) {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }
    const interview = await getInterview(id, userId)
    if (interview == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }
    return await updateInterviewDB(id, data)
}

async function getInterview(id: string, userId: string) {
    "use cache"
    cacheTag(getInterviewIdTag(id))
    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, id),
        with: {
            jobInfo: {
                columns: {
                    id: true,
                    userId: true,
                },
            },
        },
    })
    if (interview == null) return null
    cacheTag(getJobInfoIdTag(interview.jobInfoId))
    if (interview.jobInfo.userId !== userId) return null
    return interview
}
