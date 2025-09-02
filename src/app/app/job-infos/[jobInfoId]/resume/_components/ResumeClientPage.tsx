"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { UploadIcon } from "lucide-react"
import { useState } from "react"

export default function ResumeClientPage({ jobInfoId }: { jobInfoId: string }) {
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    return (
        <div className="space-y-8 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>
                        Get personalized feedback on your resume based on your
                        job description.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            // TODO:  handle file upload
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
                                // TODO: handleFileUpload(e.target.files?.[0] ?? null)
                            }}
                        />
                        <div className="flex flex-col items-center justify-center text-center gap-4">
                            <UploadIcon className="size-12 text-muted-foreground" />
                            <div className="space-y-2">
                                <p className="text-lg">
                                    Drag your resume here or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, Word docs, and text
                                    files
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
