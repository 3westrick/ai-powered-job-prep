import { pgEnum, uuid, varchar } from "drizzle-orm/pg-core"
import { createdAt, createTable, id, updatedAt } from "../schemaHelper"
import { users } from "./users"
import { relations } from "drizzle-orm"
import { jobInfos } from "./jobInfos"

export const questionDifficulties = ["easy", "medium", "hard"] as const
export type QuestionDifficulty = (typeof questionDifficulties)[number]
export const questionDifficultyEnum = pgEnum(
    "questions_question_difficulty",
    questionDifficulties
)

export const questions = createTable("questions", {
    id,
    jobInfoId: uuid()
        .references(() => jobInfos.id, { onDelete: "cascade" })
        .notNull(),
    text: varchar().notNull(),
    difficulty: questionDifficultyEnum().notNull(),
    createdAt,
    updatedAt,
})

export const questionsRelations = relations(questions, ({ one }) => ({
    jobInfo: one(jobInfos, {
        fields: [questions.jobInfoId],
        references: [jobInfos.id],
    }),
}))
