"use server"

import { jobInfos } from "@/drizzle/schema"
import db from "@/drizzle/db"
import { z } from "zod"
import { jobInfoSchema } from "./zod-schema"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { notFound, redirect } from "next/navigation"
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobInfoIdTag } from "./dbCache"
import { and, eq } from "drizzle-orm"

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }

    const { success, data } = jobInfoSchema.safeParse(unsafeData)
    if (!success) {
        return {
            error: true,
            message: "Invalid job data",
        }
    }

    const jobInfo = await insertJobInfo({ ...data, userId })

    redirect(`/app/job-infos/${jobInfo.id}`)
}

export async function updateJobInfo(
    id: string,
    unsafeData: z.infer<typeof jobInfoSchema>
) {
    const { userId } = await getCurrentUser()
    if (userId == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }

    const { success, data } = jobInfoSchema.safeParse(unsafeData)
    if (!success) {
        return {
            error: true,
            message: "Invalid job data",
        }
    }

    const existingJobInfo = await getJobInfo(id, userId)
    if (existingJobInfo == null) {
        return {
            error: true,
            message: "You don't have permission to do this",
        }
    }

    const jobInfo = await updateJobInfoDb(id, data)

    redirect(`/app/job-infos/${jobInfo.id}`)
}

export async function getJobInfo(jobInfoId: string, userId: string) {
    "use cache"
    cacheTag(getJobInfoIdTag(jobInfoId))
    try {
        return await db.query.jobInfos.findFirst({
            where: and(eq(jobInfos.id, jobInfoId), eq(jobInfos.userId, userId)),
        })
    } catch (e) {
        return null
    }
}

export async function getJobInfoWithUser(id: string, allData = false) {
    return getCurrentUser({ allData }).then(
        async ({ userId, redirectToSignIn, user }) => {
            if (!userId || (allData && !user)) return redirectToSignIn()
            const jobInfo = await getJobInfo(id, userId)
            if (!jobInfo) return notFound()
            return { jobInfo, userId, redirectToSignIn, user }
        }
    )
}
