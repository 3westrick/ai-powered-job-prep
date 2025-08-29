"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { jobInfos } from "@/drizzle/schema"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { experienceLevels } from "@/drizzle/schema"
import { jobInfoSchema } from "@/features/jobInfos/zod-schema"
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { createJobInfo, updateJobInfo } from "@/features/jobInfos/actions"
import { toast } from "sonner"
import { JobInfo } from "@/features/jobInfos/lib/types"

const jobInfoFormSchema = jobInfoSchema.extend({
    name: z
        .string()
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, "Required"),
    description: z
        .string()
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, "Required"),
    title: z
        .string()
        .nullable()
        .transform((v) => {
            if (v == null) return null
            const trimmed = v.trim()
            return trimmed === "" ? null : trimmed
        }),
})

type JobInfoFormValues = z.infer<typeof jobInfoFormSchema>

export default function JobInfoForm({
    jobInfo,
}: {
    jobInfo?: Pick<
        JobInfo,
        "id" | "name" | "title" | "description" | "experienceLevel"
    >
}) {
    const form = useForm<JobInfoFormValues>({
        resolver: zodResolver(jobInfoFormSchema),
        defaultValues: jobInfo ?? {
            name: "",
            title: null,
            description: "",
            experienceLevel: "junior",
        },
    })

    async function onSubmit(values: JobInfoFormValues) {
        // No action/db code per instructions; keep parsed data available for parent wiring
        // eslint-disable-next-line no-console
        const action = jobInfo
            ? updateJobInfo.bind(null, jobInfo.id)
            : createJobInfo
        // console.log("JobInfoForm submit:",  values)
        const res = await action(values)
        if (res.error) {
            toast.error(res.message)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 py-6"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Frontend Engineer role"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Senior React Developer"
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value || null
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experienceLevels.map((lvl) => (
                                                <SelectItem
                                                    key={lvl}
                                                    value={lvl}
                                                    className="capitalize"
                                                >
                                                    {formatExperienceLevel(lvl)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Paste the job description or summarize what you're targeting"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                    >
                        <LoadingSwap isLoading={form.formState.isSubmitting}>
                            Save Job Information
                        </LoadingSwap>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
