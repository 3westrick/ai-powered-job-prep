"use client"

import { useMemo, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { experienceLevels } from "@/drizzle/schema"
import { jobInfoSchema } from "@/features/jobInfos/zod-schema"

type JobInfoFormValues = z.infer<typeof jobInfoSchema>

export default function JobInfoForm() {
    const [values, setValues] = useState<JobInfoFormValues>(() => ({
        name: "",
        title: null,
        description: "",
        experienceLevel: "junior",
    }))

    const [errors, setErrors] = useState<
        Partial<Record<keyof JobInfoFormValues, string>>
    >({})

    const experienceLevelOptions = useMemo(() => experienceLevels, [])

    function handleChange<K extends keyof JobInfoFormValues>(
        key: K,
        value: JobInfoFormValues[K]
    ) {
        setValues((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const parsed = jobInfoSchema.safeParse({
            ...values,
            title:
                (values.title ?? "").trim() === ""
                    ? undefined
                    : values.title?.trim(),
            name: values.name.trim(),
            description: values.description.trim(),
        })

        if (!parsed.success) {
            const fieldErrors: Partial<
                Record<keyof JobInfoFormValues, string>
            > = {}
            for (const issue of parsed.error.issues) {
                const path = issue.path[0] as keyof JobInfoFormValues
                if (path != null && fieldErrors[path] == null)
                    fieldErrors[path] = issue.message
            }
            setErrors(fieldErrors)
            return
        }

        // No action/db code per instructions; keep parsed data available for parent wiring
        // eslint-disable-next-line no-console
        console.log("JobInfoForm submit:", parsed.data)
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 py-6">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Name
                </label>
                <input
                    id="name"
                    value={values.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. Frontend Engineer role"
                    aria-invalid={Boolean(errors.name) || undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name ? (
                    <p id="name-error" className="text-sm text-red-600">
                        {errors.name}
                    </p>
                ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                        Job Title (optional)
                    </label>
                    <input
                        id="title"
                        value={values.title ?? ""}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="e.g. Senior React Developer"
                        aria-invalid={Boolean(errors.title) || undefined}
                        aria-describedby={
                            errors.title ? "title-error" : undefined
                        }
                    />
                    {errors.title ? (
                        <p id="title-error" className="text-sm text-red-600">
                            {errors.title}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="experienceLevel"
                        className="text-sm font-medium"
                    >
                        Experience Level
                    </label>
                    <select
                        id="experienceLevel"
                        value={values.experienceLevel}
                        onChange={(e) =>
                            handleChange(
                                "experienceLevel",
                                e.target.value as typeof values.experienceLevel
                            )
                        }
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-invalid={
                            Boolean(errors.experienceLevel) || undefined
                        }
                        aria-describedby={
                            errors.experienceLevel
                                ? "experienceLevel-error"
                                : undefined
                        }
                    >
                        {experienceLevelOptions.map((lvl) => (
                            <option
                                key={lvl}
                                value={lvl}
                                className="capitalize"
                            >
                                {lvl}
                            </option>
                        ))}
                    </select>
                    {errors.experienceLevel ? (
                        <p
                            id="experienceLevel-error"
                            className="text-sm text-red-600"
                        >
                            {errors.experienceLevel}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Description
                </label>
                <textarea
                    id="description"
                    value={values.description}
                    onChange={(e) =>
                        handleChange("description", e.target.value)
                    }
                    className="block min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Paste the job description or summarize what you're targeting"
                    aria-invalid={Boolean(errors.description) || undefined}
                    aria-describedby={
                        errors.description ? "description-error" : undefined
                    }
                />
                {errors.description ? (
                    <p id="description-error" className="text-sm text-red-600">
                        {errors.description}
                    </p>
                ) : null}
            </div>

            <div className="flex justify-end">
                <Button type="submit">Save</Button>
            </div>
        </form>
    )
}
