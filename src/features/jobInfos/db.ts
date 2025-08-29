import db from "@/drizzle/db"
import { jobInfos } from "@/drizzle/schema"
import { revalidateJobInfoCache } from "./dbCache"
import { eq } from "drizzle-orm"
import { JobInfoInsert } from "./lib/types"

export async function insertJobInfo(jobInfo: JobInfoInsert) {
    const [newJobInfo] = await db.insert(jobInfos).values(jobInfo).returning({
        id: jobInfos.id,
        userId: jobInfos.userId,
    })

    revalidateJobInfoCache(newJobInfo)

    return newJobInfo
}

export async function updateJobInfo(
    id: string,
    jobInfo: Partial<JobInfoInsert>
) {
    const [updatedJobInfo] = await db
        .update(jobInfos)
        .set(jobInfo)
        .where(eq(jobInfos.id, id))
        .returning({
            id: jobInfos.id,
            userId: jobInfos.userId,
        })

    revalidateJobInfoCache(updatedJobInfo)

    return updatedJobInfo
}
