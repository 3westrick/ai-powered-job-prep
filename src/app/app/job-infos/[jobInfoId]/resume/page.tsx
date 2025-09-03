import { getJobInfo } from "@/features/jobInfos/actions"
import { canCreateQuestion } from "@/features/questions/permissions"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { Loader2Icon } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import JobInfoBackLink from "@/components/jobinfo-back-link"
import ResumeClientPage from "./_components/ResumeClientPage"
import { canRunResumeAnalysis } from "@/features/resume/permissions"

export default async function ResumePage({
    params,
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params

    return (
        <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
            <JobInfoBackLink jobInfoId={jobInfoId} />
            <Suspense
                fallback={
                    <Loader2Icon className="size-24 animate-spin m-auto" />
                }
            >
                <SuspendedComponent jobInfoId={jobInfoId} />
            </Suspense>
        </div>
    )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
    if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade")
    return <ResumeClientPage jobInfoId={jobInfoId} />
}
