import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    // Application
    APP_KEY: z.string().min(10, 'APP_KEY is required'),

    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

    // Osu API Credentials
    CLIENT_ID: z.coerce.number().int().positive(),
    CLIENT_SECRET: z.string().min(1, 'CLIENT_SECRET is required'),

    // Logging
    LOG_OSU_API_REQUESTS: z
        .enum(['true', 'false'])
        .default('false')
        .transform((value) => value === 'true'),

    // Osu API Requests Limit
    OSU_API_REQUESTS_IN_MINUTE: z.coerce.number().int().positive().default(60),

    OSU_API_REQUESTS_HIGH_WATER: z.coerce.number().int().positive().default(120),

    // Database
    DB_HOST: z.string().min(1, 'DB_HOST is required'),
    DB_PORT: z.coerce.number().int().min(1).max(65535),
    DB_NAME: z.string().min(1, 'DB_NAME is required'),
    DB_USER: z.string().min(1, 'DB_USER is required'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
