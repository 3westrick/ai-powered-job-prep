import JobInfoForm from "@/components/job-info-form"
import JobInfoBackLink from "@/components/jobinfo-back-link"
import { Card, CardContent } from "@/components/ui/card"
import { getJobInfoWithUser } from "@/features/jobInfos/actions"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

export default async function JobInfoNewPage({
    params,
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params

    return (
        <div className="container my-4 max-w-5xl space-y-4">
            <JobInfoBackLink jobInfoId={jobInfoId} />

            <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

            <Card>
                <CardContent>
                    <Suspense
                        fallback={
                            <Loader2 className="size-24 animate-spin mx-auto" />
                        }
                    >
                        <SuspendedForm jobInfoId={jobInfoId} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
    const jobInfo = await getJobInfoWithUser(jobInfoId)
    return <JobInfoForm jobInfo={jobInfo.jobInfo} />
}
