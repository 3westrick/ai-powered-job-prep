import { uuid, varchar } from "drizzle-orm/pg-core"
import { createdAt, createTable, id, updatedAt } from "../schemaHelper"
import { jobInfos } from "./jobInfos"
import { relations } from "drizzle-orm"

export const interviews = createTable("interviews", {
    id,
    jobInfoId: uuid()
        .references(() => jobInfos.id, { onDelete: "cascade" })
        .notNull(),
    duration: varchar().notNull(),
    humeChatId: varchar(),
    feedback: varchar(),
    createdAt,
    updatedAt,
})

export const interviewsRelations = relations(interviews, ({ one }) => ({
    jobInfo: one(jobInfos, {
        fields: [interviews.jobInfoId],
        references: [jobInfos.id],
    }),
}))
