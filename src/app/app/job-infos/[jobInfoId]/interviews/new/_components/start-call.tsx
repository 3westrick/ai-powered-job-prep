"use client"
import { Button } from "@/components/ui/button"
import { env } from "@/data/env/client"
import { JobInfo } from "@/features/jobInfos/lib/types"
import { UserComponent } from "@/features/users/lib/types"
import { useVoice, VoiceReadyState } from "@humeai/voice-react"

export function StartCall({
    jobInfo,
    user,
    accessToken,
}: {
    jobInfo: Pick<JobInfo, "id" | "description" | "title" | "experienceLevel">
    user: UserComponent
    accessToken: string
}) {
    const { connect, disconnect, readyState } = useVoice()

    if (readyState === VoiceReadyState.IDLE) {
        return (
            <div className="center h-screen-header">
                <Button
                    size={"lg"}
                    onClick={() => {
                        // TODO: Create interview
                        connect({
                            auth: {
                                type: "accessToken",
                                value: accessToken,
                            },
                            configId: env.NEXT_PUBLIC_HUME_PUBLICK_ID,
                            sessionSettings: {
                                type: "session_settings",
                                variables: {
                                    userName: user?.name,
                                    title: jobInfo.title || "Not Specified",
                                    description: jobInfo.description,
                                    experienceLevel: jobInfo.experienceLevel,
                                },
                            },
                        })
                    }}
                >
                    Start Interview
                </Button>
            </div>
        )
    }

    if (
        readyState === VoiceReadyState.CONNECTING ||
        readyState === VoiceReadyState.CLOSED
    ) {
        return null
    }

    return <div>Connected</div>
}
