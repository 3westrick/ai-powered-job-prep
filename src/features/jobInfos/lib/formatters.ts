import { ExperienceLevel } from "@/drizzle/schema"

export function formatExperienceLevel(level: ExperienceLevel) {
    switch (level) {
        case "junior":
            return "Junior"
        case "mid":
            return "Mid"
        case "senior":
            return "Senior"
        default:
            throw new Error(
                `Unknown experience level: ${level satisfies never}`
            )
    }
}
