import { cn } from "@/lib/utils"
import BackLink from "./back-link"
import { getJobInfoWithUser } from "@/features/jobInfos/actions"
import SuspendedItem from "./suspended-item"

export default function JobInfoBackLink({
    jobInfoId,
    className,
}: {
    jobInfoId: string
    className?: string
}) {
    const jobInfoPromise = getJobInfoWithUser(jobInfoId)
    return (
        <BackLink
            href={`/app/job-infos/${jobInfoId}`}
            className={cn("mb-4", className)}
        >
            <SuspendedItem
                item={jobInfoPromise}
                fallback={"Job Description"}
                result={(j) => j.title || "Job Description"}
            />
        </BackLink>
    )
}
