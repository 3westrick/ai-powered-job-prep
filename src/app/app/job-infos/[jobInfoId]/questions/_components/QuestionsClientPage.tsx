import BackLink from "@/components/back-link"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { JobInfo } from "@/features/jobInfos/lib/types"

export default function QuestionsClientPage({
    jobInfo,
}: {
    jobInfo: Pick<JobInfo, "id" | "name" | "title">
}) {
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
            <QuestionContainer />
        </div>
    )
}

function QuestionContainer() {
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
                Left Panel
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="answer-" defaultSize={50} minSize={5}>
                Right Panel
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
