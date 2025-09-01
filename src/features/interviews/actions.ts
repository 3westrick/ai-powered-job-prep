"use server"

import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { getJobInfo } from "../jobInfos/actions"
import { insertInterview, updateInterview as updateInterviewDB } from "./db"
import { InterviewInsert } from "./lib/types"
import { getInterviewIdTag, getInterviewJobInfoTag } from "./dbCache"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import db from "@/drizzle/db"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { interviews } from "@/drizzle/schema"
import { getJobInfoIdTag } from "../jobInfos/dbCache"
import { canCreateInterview } from "./permissions"
import { PLAN_LIMIT, RATE_LIMIT } from "@/lib/errorToast"
import arcjet, { request, tokenBucket } from "@arcjet/next"
import { generateAiInterviewFeedback } from "@/services/ai/interviews"

const aj = arcjet({
    characteristics: ["userId"],
    key: process.env.ARCJET_KEY!,
    rules: [
        tokenBucket({
            capacity: 12,
            refillRate: 4,
            interval: "1d",
            mode: "LIVE",
        }),
    ],
})

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
    if (!(await canCreateInterview())) {
        return {
            error: true,
            message: PLAN_LIMIT,
        }
    }
    // rate limit
    const decision = await aj.protect(await request(), {
        userId,
        requested: 1,
    })

    if (decision.isDenied()) {
        return {
            error: true,
            message: RATE_LIMIT,
        }
    }

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

export async function getInterview(id: string, userId: string) {
    "use cache"
    cacheTag(getInterviewIdTag(id))
    const interview = await db.query.interviews.findFirst({
        where: eq(interviews.id, id),
        with: {
            jobInfo: {
                columns: {
                    id: true,
                    userId: true,
                    title: true,
                    experienceLevel: true,
                    description: true,
                },
            },
        },
    })
    if (interview == null) return null
    cacheTag(getJobInfoIdTag(interview.jobInfoId))
    if (interview.jobInfo.userId !== userId) return null
    return interview
}

export async function getInterviews(jobInfoId: string, userId: string) {
    "use cache"
    cacheTag(getInterviewJobInfoTag(jobInfoId))
    cacheTag(getJobInfoIdTag(jobInfoId))

    const jobInterviews = await db.query.interviews.findMany({
        where: and(
            eq(interviews.jobInfoId, jobInfoId),
            isNotNull(interviews.humeChatId)
        ),
        orderBy: [desc(interviews.createdAt)],
        with: {
            jobInfo: {
                columns: {
                    userId: true,
                },
            },
        },
    })

    return jobInterviews.filter(
        (interview) => interview.jobInfo.userId === userId
    )
}

export async function generateInterviewFeedback(interviewId: string) {
    const { userId, user } = await getCurrentUser({ allData: true })
    if (userId == null || user == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }
    const interview = await getInterview(interviewId, userId)
    if (interview == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }
    if (interview.humeChatId == null) {
        return {
            error: true,
            message: "Interview has not been completed yet",
        }
    }
    const feedback = await generateAiInterviewFeedback({
        humeChatId: interview.humeChatId,
        jobInfo: interview.jobInfo,
        userName: user.name,
    })
    if (feedback == null) {
        return {
            error: true,
            message: "Failed to generate feedback",
        }
    }
    await updateInterviewDB(interviewId, { feedback })
    return {
        error: false,
    }
}
