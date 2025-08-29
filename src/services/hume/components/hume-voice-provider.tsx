import { VoiceProvider as OriginalVoiceProvider } from "@humeai/voice-react"

export function VoiceProvider({ children }: { children: React.ReactNode }) {
    return <OriginalVoiceProvider>{children}</OriginalVoiceProvider>
}
