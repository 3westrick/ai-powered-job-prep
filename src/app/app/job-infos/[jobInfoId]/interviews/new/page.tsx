import JobInfoForm from "@/components/job-info-form"
import JobInfoBackLink from "@/components/jobinfo-back-link"
import db from "@/drizzle/db"
import { interviews } from "@/drizzle/schema"
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache"
import { getJobInfoWithUser } from "@/features/jobInfos/actions"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { VoiceProvider } from "@/services/hume/components/hume-voice-provider"
import { getHumeAccessToken } from "@/services/hume/lib/getHumeAccessToken"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { Loader2Icon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { StartCall } from "./_components/start-call"

export default async function InterviewsPage({
    params,
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params

    return (
        <Suspense
            fallback={
                <div className="center h-screen-header">
                    <Loader2Icon className="size-24 animate-spin" />
                </div>
            }
        >
            <SuspendedComponent jobInfoId={jobInfoId} />
        </Suspense>
    )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
    if (!jobInfoId) return notFound()
    const { jobInfo, user } = await getJobInfoWithUser(jobInfoId, true)
    if (!user) return notFound()
    const accessToken = await getHumeAccessToken()
    return (
        <VoiceProvider>
            <StartCall
                jobInfo={jobInfo}
                user={user}
                accessToken={accessToken}
            />
        </VoiceProvider>
    )
}

async function getInterviews(jobInfoId: string, userId: string) {
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
