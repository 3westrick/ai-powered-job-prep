import JobInfoForm from "@/components/job-info-form"
import JobInfoBackLink from "@/components/jobinfo-back-link"
import db from "@/drizzle/db"
import { interviews } from "@/drizzle/schema"
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache"
import { getJobInfoWithUser } from "@/features/jobInfos/actions"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { Loader2Icon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function InterviewsPage({
    params,
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params

    return (
        <div className="container py-4 flex flex-col gap-4 h-screen-header items-start">
            <JobInfoBackLink jobInfoId={jobInfoId} />

            <Suspense
                fallback={
                    <Loader2Icon className="size-24 animate-spin m-auto" />
                }
            >
                <SuspendedPage jobInfoId={jobInfoId} />
            </Suspense>
        </div>
    )
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
    // const jobInfo = await getJobInfoWithUser(jobInfoId)
    // await new Promise((resolve) => setTimeout(resolve, 2000))
    const { redirectToSignIn, userId } = await getCurrentUser()
    if (!userId) return redirectToSignIn()
    const interviews = await getInterviews(jobInfoId, userId)
    if (interviews.length === 0)
        redirect(`/app/job-infos/${jobInfoId}/interviews/new`)

    return <div>Interviews for job info Id {jobInfoId}</div>
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
