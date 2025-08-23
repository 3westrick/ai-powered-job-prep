import { deleteUser, upsertUser } from "@/features/users/db"
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const event = await verifyWebhook(request)
        switch (event.type) {
            case "user.created":
            case "user.updated":
                const clrekData = event.data
                const email = clrekData.email_addresses.find(
                    (e) => e.id === clrekData.primary_email_address_id
                )?.email_address
                if (!email) {
                    return new Response("No Primary Email Found", {
                        status: 400,
                    })
                }
                await upsertUser({
                    id: clrekData.id,
                    email,
                    name: `${clrekData.first_name} ${clrekData.last_name}`,
                    imageUrl: clrekData.image_url,
                    createdAt: new Date(clrekData.created_at),
                    updatedAt: new Date(clrekData.updated_at),
                })
                break
            case "user.deleted":
                if (!event.data.id)
                    return new Response("No User ID Found", { status: 400 })
                await deleteUser(event.data.id)
                break
            default:
                return new Response("Invalid Event", { status: 400 })
        }
    } catch (error) {
        return new Response("Invalid Webhook", { status: 400 })
    }
    return new Response("Webhook received", { status: 200 })
}
