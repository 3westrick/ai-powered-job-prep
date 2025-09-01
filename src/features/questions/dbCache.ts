import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getQuestionsGlobalTag() {
    return getGlobalTag("questions")
}

export function getQuestionsJobInfoTag(jobInfoId: string) {
    return getJobInfoTag("questions", jobInfoId)
}

export function getQuestionsIdTag(id: string) {
    return getIdTag("questions", id)
}

export function revalidateInterviewCache({
    id,
    jobInfoId,
}: {
    id: string
    jobInfoId: string
}) {
    revalidateTag(getQuestionsGlobalTag())
    revalidateTag(getQuestionsJobInfoTag(jobInfoId))
    revalidateTag(getQuestionsIdTag(id))
}
