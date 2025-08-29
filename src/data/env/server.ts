import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    server: {
        ARCJET_KEY: z.string().min(1),
        CLERK_SECRET_KEY: z.string().min(1),
        DB_HOST: z.string().min(1),
        DB_PORT: z.string().min(1),
        DB_USER: z.string().min(1),
        DB_PASSWORD: z.string().min(1),
        DB_NAME: z.string().min(1),
        HUME_API_KEY: z.string().min(1),
        HUME_SECRET_KEY: z.string().min(1),
    },
    createFinalSchema: (env) => {
        return z.object(env).transform((env) => ({
            ...env,
            DATABASE_URL: `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
        }))
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: process.env,
})
