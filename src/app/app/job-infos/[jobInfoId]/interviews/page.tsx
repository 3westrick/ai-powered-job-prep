import JobInfoForm from "@/components/job-info-form"
import JobInfoBackLink from "@/components/jobinfo-back-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import db from "@/drizzle/db"
import { interviews } from "@/drizzle/schema"
import { getInterviewJobInfoTag } from "@/features/interviews/dbCache"
import { getJobInfoWithUser } from "@/features/jobInfos/actions"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import formatDateTime from "@/lib/formatDateTime"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
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

    return (
        <div className="space-y-6 w-full">
            <div className="flex gap-2 justify-between">
                <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
                <Button asChild>
                    <Link href={`/app/job-infos/${jobInfoId}/interviews/new`}>
                        <PlusIcon />
                        New Interview
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
                <Link
                    className="transition-opacity"
                    href={`/app/job-infos/${jobInfoId}/interviews/new`}
                >
                    <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
                        <div className="text-lg flex items-center gap-2">
                            <PlusIcon className="size-6" />
                            New Interview
                        </div>
                    </Card>
                </Link>
                {interviews.map((interview) => (
                    <Link
                        className="hover:scale-[1.02] transition-[transform_opacity]"
                        href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`}
                        key={interview.id}
                    >
                        <Card className="h-full">
                            <div className="flex items-center justify-between h-full">
                                <CardHeader className="gap-1 flex-grow">
                                    <CardTitle className="text-lg">
                                        {formatDateTime(interview.createdAt)}
                                    </CardTitle>
                                    <CardDescription>
                                        {interview.duration}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <ArrowRightIcon className="size-6" />
                                </CardContent>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
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
