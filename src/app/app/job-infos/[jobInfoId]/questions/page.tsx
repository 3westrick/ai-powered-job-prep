import { getJobInfo } from "@/features/jobInfos/actions"
import { canCreateQuestion } from "@/features/questions/permissions"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { Loader2Icon } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import QuestionsClientPage from "./_components/QuestionsClientPage"

export default async function QuestionsPage({
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
    const { userId, redirectToSignIn } = await getCurrentUser()
    if (!userId) return redirectToSignIn()
    if (!(await canCreateQuestion())) return redirect("/app/upgrade")
    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (!jobInfo) return notFound()

    return <QuestionsClientPage jobInfo={jobInfo} />
}
