import JobInfoBackLink from "@/components/jobinfo-back-link"

export default async function InterviewPage({
    params,
}: {
    params: Promise<{ jobInfoId: string; interviewId: string }>
}) {
    const { jobInfoId, interviewId } = await params

    return (
        <div className="container py-4 flex flex-col gap-4 h-screen-header items-start">
            <JobInfoBackLink jobInfoId={jobInfoId} />
            Interview {interviewId} for job info {jobInfoId}
        </div>
    )
}
