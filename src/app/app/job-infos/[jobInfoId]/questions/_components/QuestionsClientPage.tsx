import BackLink from "@/components/back-link"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { JobInfo } from "@/features/jobInfos/lib/types"
import { useState } from "react"

type Status = "awaiting-answer" | "awaiting-difficulty" | "init"

export default function QuestionsClientPage({
    jobInfo,
}: {
    jobInfo: Pick<JobInfo, "id" | "name" | "title">
}) {
    const [status, setStatus] = useState<Status>("init")
    const [answer, setAnswer] = useState<string | null>(null)
    const question = null
    const feedback = null

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-[2000px] mx-auto flex-grow h-screen-header">
            <div className="container flex gap-4 mt-4 items-center justify-between">
                <div className="flex-grow basis-0">
                    <BackLink href={`/app/job-infos/${jobInfo.id}`}>
                        {jobInfo.name}
                    </BackLink>
                </div>
                <Controls />
                <div className="flex-grow hidden md:block" />
            </div>
            <QuestionContainer
                question={question}
                feedback={feedback}
                answer={answer}
                status={status}
                setAnswer={setAnswer}
            />
        </div>
    )
}

function QuestionContainer({
    question,
    feedback,
    answer,
    status,
    setAnswer,
}: {
    question: string | null
    feedback: string | null
    answer: string | null
    status: Status
    setAnswer: (answer: string) => void
}) {
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="flex-grow border-t"
        >
            <ResizablePanel
                id="question-and-feedback"
                defaultSize={50}
                minSize={5}
            >
                <ResizablePanelGroup direction="vertical" className="flex-grow">
                    <ResizablePanel id="question" defaultSize={25} minSize={5}>
                        <ScrollArea className="h-full min-w-48 *:h-full">
                            {status == "init" ? (
                                <p className="text-lg center h-full">
                                    Get started by selecting a question
                                    difficulty above.
                                </p>
                            ) : (
                                question && (
                                    <MarkdownRenderer className="p-6">
                                        {question}
                                    </MarkdownRenderer>
                                )
                            )}
                        </ScrollArea>
                    </ResizablePanel>
                    {feedback && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel
                                id="feedback"
                                defaultSize={75}
                                minSize={5}
                            >
                                <ScrollArea className="h-full min-w-48 *:h-full">
                                    <MarkdownRenderer className="p-6">
                                        {feedback}
                                    </MarkdownRenderer>
                                </ScrollArea>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="answer-" defaultSize={50} minSize={5}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                    <Textarea
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer ?? ""}
                        placeholder="Type your answer here..."
                        className="h-full w-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset !text-base p-6 "
                    />
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

function Controls() {
    return (
        <div className="flex items-center gap-2">
            <Button variant={"default"}>Create Question</Button>
            <Button variant={"secondary"}>Cancel</Button>
        </div>
    )
}
