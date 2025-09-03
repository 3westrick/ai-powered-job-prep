import hasPermission from "@/services/clerk/lib/hasPermission"

export async function canRunResumeAnalysis() {
    return hasPermission("unlimites_resume_analysis")
}
