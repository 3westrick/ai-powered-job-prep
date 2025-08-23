import { pgEnum, varchar } from "drizzle-orm/pg-core"
import { createdAt, createTable, id, updatedAt } from "../schemaHelper"
import { users } from "./users"
import { relations } from "drizzle-orm"
import { interviews } from "./interviews"
import { questions } from "./questions"

export const experienceLevels = ["junior", "mid", "senior"] as const
export type ExperienceLevel = (typeof experienceLevels)[number]
export const experienceLevelEnum = pgEnum(
    "job_infos_experience_level",
    experienceLevels
)

export const jobInfos = createTable("job_infos", {
    id,
    title: varchar(),
    name: varchar().notNull(),
    experienceLevel: experienceLevelEnum().notNull(),
    description: varchar().notNull(),
    userId: varchar()
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    createdAt,
    updatedAt,
})

export const jobInfosRelations = relations(jobInfos, ({ one, many }) => ({
    user: one(users, {
        fields: [jobInfos.userId],
        references: [users.id],
    }),
    interviews: many(interviews),
    questions: many(questions),
}))
