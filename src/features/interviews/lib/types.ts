import { interviews } from "@/drizzle/schema"

export type InterviewInsert = typeof interviews.$inferInsert
export type Interview = typeof interviews.$inferSelect
