import { questions } from "@/drizzle/schema"

export type Question = typeof questions.$inferSelect
export type QuestionInsert = typeof questions.$inferInsert
