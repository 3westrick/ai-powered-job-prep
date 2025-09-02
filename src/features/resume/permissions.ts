import hasPermission from "@/services/clerk/lib/hasPermission"

export async function canRunResumeAiAnalysis() {
    return hasPermission("unlimites_resume_analysis")
}
