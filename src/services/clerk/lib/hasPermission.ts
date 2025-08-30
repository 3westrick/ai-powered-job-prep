import { auth } from "@clerk/nextjs/server"

type Permission =
    | "unlimited_interviews"
    | "unlimites_resume_analysis"
    | "unlimited_questions"
    | "1_interview"
    | "5_questions"
    | "1_interview"

type Role = "free_user" | "basic" | "pro"

export default async function hasPermission(permission: Permission) {
    const { has } = await auth()
    return has({
        feature: permission,
    })
}
