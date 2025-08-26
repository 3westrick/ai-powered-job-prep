import BackLink from "@/components/back-link"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import db from "@/drizzle/db"
import { jobInfos } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import getCurrentUser from "@/services/clerk/lib/getCurrentUser"
import { and, eq } from "drizzle-orm"
import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

const options = [
    {
        label: "Answer Technical Questions",
        description:
            "Challenge yourself with practice questions tailored to your job description.",
        href: "questions",
    },
    {
        label: "Practice Interviewing",
        description:
            "Simulate a real interview with AI-powered mock interviews.",
        href: "interviews",
    },
    {
        label: "Refine Your Resume",
        description:
            "Get expert feedback on your resume and improve your chances of landing an interview.",
        href: "resume",
    },
    {
        label: "Update Job Description",
        description: "This should only be used for minor updates.",
        href: "edit",
    },
]

export default async function JobInfoPage({
    params,
}: {
    params: Promise<{ jobInfoId: string }>
}) {
    const { jobInfoId } = await params
    const { userId, redirectToSignIn } = await getCurrentUser()

    if (!userId) return redirectToSignIn()

    const jobInfo = await getJobInfo(jobInfoId, userId)
    if (!jobInfo) return notFound()

    return (
        <div className="container my-4 space-y-4">
            <BackLink href="/app">Dashboard</BackLink>

            <div className="space-y-6">
                <header className="space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl">{jobInfo.name}</h1>
                        <div className="flex gap-2">
                            <Badge variant="secondary">
                                {formatExperienceLevel(jobInfo.experienceLevel)}
                            </Badge>
                            {jobInfo.title && (
                                <Badge variant="secondary">
                                    {jobInfo.title}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <p className="text-muted-foreground line-clamp-3">
                        {jobInfo.description}
                    </p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
                    {options.map((option) => (
                        <Link
                            className="hover:scale-[1.02] transition-[transform_opacity]"
                            href={`/app/job-infos/${jobInfoId}/${option.href}`}
                            key={option.href}
                        >
                            <Card className="h-full flex items-start justify-between flex-row">
                                <CardHeader className="flex-grow">
                                    <CardTitle>{option.label}</CardTitle>
                                    <CardDescription>
                                        {option.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ArrowRightIcon className="size-6" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

async function getJobInfo(jobInfoId: string, userId: string) {
    "use cache"
    getJobInfoIdTag(jobInfoId)

    return await db.query.jobInfos.findFirst({
        where: and(eq(jobInfos.id, jobInfoId), eq(jobInfos.userId, userId)),
    })
}
