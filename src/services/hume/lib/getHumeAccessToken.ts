import { env } from "@/data/env/server"
import { fetchAccessToken } from "hume"

export async function getHumeAccessToken() {
    return await fetchAccessToken({
        apiKey: String(env.HUME_API_KEY),
        secretKey: String(env.HUME_SECRET_KEY),
    })
}
