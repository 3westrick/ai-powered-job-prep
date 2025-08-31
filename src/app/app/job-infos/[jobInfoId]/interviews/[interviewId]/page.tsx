import BackLink from "@/components/back-link"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Skeleton, SkeletonButton } from "@/components/skleton"
import SuspendedItem from "@/components/suspended-item"
import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    generateInterviewFeedback,
    getInterview,
} from "@/features/interviews/actions"
import formatDateTime from "@/lib/formatDateTime"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import CondensedMessages from "@/services/hume/components/condensed-messages"
import { fetchChatMessages } from "@/services/hume/lib/api"
import { condenseChatMessages } from "@/services/hume/lib/condenseChatMessages"
import { Loader2Icon } from "lucide-react"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default async function InterviewPage({
    params,
}: {
    params: Promise<{ jobInfoId: string; interviewId: string }>
}) {
    const { jobInfoId, interviewId } = await params

    const interview = getCurrentUser().then(
        async ({ userId, redirectToSignIn }) => {
            if (userId == null) return redirectToSignIn()
            const interview = await getInterview(interviewId, userId)
            if (interview == null) return notFound()
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return interview
        }
    )

    return (
        <div className="container my-4 space-y-4">
            <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
                All interviews
            </BackLink>
            <div className="space-y-6">
                <div className="flex gap-2 justify-between">
                    <div className="space-y-2 mb-6">
                        <h1 className="text-3xl md:text-4xl">
                            Interview:{" "}
                            <SuspendedItem
                                item={interview}
                                fallback={<Skeleton className="w-48" />}
                                result={(i) => formatDateTime(i.createdAt)}
                            />
                        </h1>
                        <p className="text-muted-foreground">
                            <SuspendedItem
                                item={interview}
                                fallback={<Skeleton className="w-24" />}
                                result={(i) => i.duration}
                            />
                        </p>
                    </div>
                    <SuspendedItem
                        item={interview}
                        fallback={<SkeletonButton className="w-32" />}
                        result={(i) =>
                            i.feedback == null || i.feedback == "" ? (
                                <ActionButton
                                    action={generateInterviewFeedback.bind(
                                        null,
                                        i.id
                                    )}
                                >
                                    Generate Feedback
                                </ActionButton>
                            ) : (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button>View Feedback</Button>
                                    </DialogTrigger>
                                    <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-4rem)] overflow-x-clip overflow-y-auto flex flex-col">
                                        <DialogTitle>Feedback</DialogTitle>
                                        <MarkdownRenderer>
                                            {i.feedback}
                                        </MarkdownRenderer>
                                    </DialogContent>
                                </Dialog>
                            )
                        }
                    />
                </div>
                <Suspense
                    fallback={
                        <Loader2Icon className="animate-spin mx-auto size-24" />
                    }
                >
                    <Messages interview={interview} />
                </Suspense>
            </div>
        </div>
    )
}

async function Messages({
    interview,
}: {
    interview: Promise<{ humeChatId: string | null }>
}) {
    const { user, redirectToSignIn } = await getCurrentUser({ allData: true })
    if (user == null) return redirectToSignIn()
    const { humeChatId } = await interview
    if (humeChatId == null) return notFound()
    const condenseMessages = condenseChatMessages(
        await fetchChatMessages(humeChatId)
    )
    return (
        <CondensedMessages
            messages={condenseMessages}
            user={user}
            className="max-w-5xl mx-auto"
        />
    )
}
