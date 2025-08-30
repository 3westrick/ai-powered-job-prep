import { env } from "@/data/env/server"
import { HumeClient } from "hume"
import { ReturnChatEvent } from "hume/api/resources/empathicVoice"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function fetchChatMessages(humeChatId: string) {
    "use cache"
    cacheTag("")

    const client = new HumeClient({
        apiKey: String(env.HUME_API_KEY),
    })
    const allChatEvents: ReturnChatEvent[] = []
    const chatEventIterator = await client.empathicVoice.chats.listChatEvents(
        humeChatId,
        {
            pageSize: 100,
            pageNumber: 0,
        }
    )

    for await (const chatEvent of chatEventIterator) {
        allChatEvents.push(chatEvent)
    }

    return allChatEvents
}
