import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/",
    "/api/webhooks(.*)",
])

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
            // Block all bots except the following
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                // Uncomment to allow these other common bot categories
                // See the full list at https://arcjet.com/bot-list
                "CATEGORY:MONITOR", // Uptime monitoring services
                "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
            ],
        }),
        slidingWindow({
            mode: "LIVE",
            interval: "1m",
            max: 1000,
        }),
    ],
})

export default clerkMiddleware(async (auth, req) => {
    // const decision = await aj.protect(req)
    // if (decision.isDenied()) {
    //     return new Response(null, { status: 403 })
    // }
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
}
