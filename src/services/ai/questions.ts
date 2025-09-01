import { JobInfo } from "@/features/jobInfos/lib/types"
import { fetchChatMessages } from "../hume/lib/api"
import { CoreMessage, streamText } from "ai"
import { lmstudio } from "./models/lmstudio"
import { QuestionDifficulty } from "@/drizzle/schema"
import { Question } from "@/features/questions/lib/types"

export function generateAiQuestion({
    previousQuestions,
    jobInfo,
    difficulty,
    onFinish,
}: {
    previousQuestions: Pick<Question, "text" | "difficulty">[]
    jobInfo: Pick<JobInfo, "title" | "description" | "experienceLevel">
    difficulty: QuestionDifficulty
    onFinish: (question: string) => void
}) {
    const previousMessages = previousQuestions.flatMap(
        (q) =>
            [
                { role: "user", content: q.difficulty },
                { role: "assistant", content: q.text },
            ] satisfies CoreMessage[]
    )

    console.log("Calling model")
    return streamText({
        // model: lmstudio("google/gemma-3-4b"),
        model: lmstudio("qwen/qwen3-4b-2507"),
        onFinish: ({ text }) => onFinish(text),
        messages: [...previousMessages, { role: "user", content: difficulty }],
        system: `You are an AI assistant that creates technical interview questions tailored to a specific job role. Your task is to generate one **realistic and relevant** technical question that matches the skill requirements of the job and aligns with the difficulty level provided by the user.
Job Information:
- Job Description: \`${jobInfo.description}\`
- Experience Level: \`${jobInfo.experienceLevel}\`
${jobInfo.title ? `\n- Job Title: \`${jobInfo.title}\`` : ""}

Guidelines:
- The question must reflect the skills and technologies mentioned in the job description.
- Make sure the question is appropriately scoped for the specified experience level.
- A difficulty level of "easy", "medium", or "hard" is provided by the user and should be used to tailor the question.
- Prefer practical, real-world challenges over trivia.
- Return only the question, clearly formatted (e.g., with code snippets or bullet points if needed). Do not include the answer.
- Return only one question at a time.
- It is ok to ask a question about just a single part of the job description, such as a specific technology or skill (e.g., if the job description is for a Next.js, Drizzle, and TypeScript developer, you can ask a TypeScript only question).
- The question should be formatted as markdown as it goes directly into a markdown renderer.
- Stop generating output as soon you have provided the full question.`,
    })
}
