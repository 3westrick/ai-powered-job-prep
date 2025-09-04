import { Skeleton } from "@/components/skleton"
import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"

export default function CategoryAccordionHeader({
    title,
    score,
}: {
    title: string
    score: number | undefined | null
}) {
    let badge: ReactNode
    if (score == null) {
        badge = <Skeleton className="w-16" />
    } else if (score >= 8) {
        badge = <Badge>Excellent</Badge>
    } else if (score >= 6) {
        badge = <Badge variant="warning">Good</Badge>
    } else {
        badge = <Badge variant="destructive">Needs Improvement</Badge>
    }
    return (
        <div className="flex items-start justify-between w-full">
            <div className="flex flex-col items-start gap-1">
                <span>{title}</span>
                <div className="no-underline">{badge}</div>
            </div>
            {score == null ? <Skeleton className="w-12" /> : `${score}/10`}
        </div>
    )
}
