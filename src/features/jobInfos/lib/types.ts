import { jobInfos } from "@/drizzle/schema"

export type JobInfo = typeof jobInfos.$inferSelect
export type JobInfoInsert = typeof jobInfos.$inferInsert
