"use client"

import { Alert } from "@/components/ui/alert"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { cn } from "@/lib/utils"
import { aiAnalyzeSchema } from "@/services/ai/resume/schemas"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { UploadIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export default function ResumeClientPage({ jobInfoId }: { jobInfoId: string }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const fileRef = useRef<File | null>(null)
    const {
        object: aiAnalysis,
        isLoading,
        submit: generateAnalysis,
        error,
    } = useObject({
        api: "/api/ai/resumes/analyze",
        schema: aiAnalyzeSchema,
        onFinish({ object, error }) {
            // typed object, undefined if schema validation fails:
            console.log("Object generation completed:", object)

            // error, undefined if schema validation succeeds:
            console.log("Schema validation error:", error)
        },
        onError(error) {
            // error during fetch request:
            console.error("An error occurred:", error)
        },
        fetch: (url, options) => {
            const headers = new Headers(options?.headers)
            headers.delete("Content-Type")
            const formData = new FormData()
            if (fileRef.current != null) {
                console.log("File found")
                formData.append("resumeFile", fileRef.current)
            }
            formData.append("jobInfoId", jobInfoId)
            return fetch(url, { ...options, headers, body: formData })
        },
    })

    function handleFileUpload(file: File | null) {
        fileRef.current = file
        if (file == null) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB")
            return
        }
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]

        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF, Word document, or text file")
            return
        }

        generateAnalysis(null)
    }

    return (
        <div className="space-y-8 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isLoading
                            ? "Analyzing your resume"
                            : "Upload Your Resume"}
                    </CardTitle>
                    <CardDescription>
                        {isLoading
                            ? "We're analyzing your resume, this may take a few minutes."
                            : "Get personalized feedback on your resume based on your job description."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoadingSwap
                        loadinIconClassName="size-16"
                        isLoading={isLoading}
                    >
                        <div
                            className={cn(
                                "mt-2 border-2 border-dashed rounded-lg p-6 transition-colors relative",
                                isDraggingOver
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/50 bg-muted/10"
                            )}
                            onDragOver={(e) => {
                                e.preventDefault()
                                setIsDraggingOver(true)
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault()
                                setIsDraggingOver(false)
                            }}
                            onDrop={(e) => {
                                e.preventDefault()
                                setIsDraggingOver(false)
                                handleFileUpload(
                                    e.dataTransfer.files[0] ?? null
                                )
                            }}
                            onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                            }}
                        >
                            <label htmlFor="resume-upload" className="sr-only">
                                Upload Your Resume
                            </label>
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                className="opacity-0 absolute inset-0 cursor-pointer"
                                onChange={(e) => {
                                    handleFileUpload(
                                        e.target.files?.[0] ?? null
                                    )
                                }}
                            />
                            <div className="flex flex-col items-center justify-center text-center gap-4">
                                <UploadIcon className="size-12 text-muted-foreground" />
                                <div className="space-y-2">
                                    <p className="text-lg">
                                        Drag your resume here or click to upload
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: PDF, Word docs, and
                                        text files
                                    </p>
                                </div>
                            </div>
                        </div>
                    </LoadingSwap>
                </CardContent>
            </Card>
            {error && <Alert variant="destructive">{error.message}</Alert>}
            <pre>
                <code>{JSON.stringify(aiAnalysis, null, 2)}</code>
            </pre>
        </div>
    )
}
