import 'dotenv/config'
import { z } from 'zod'

const DEFAULT_ANALYZER_URL = 'http://localhost:3000/skillsets'

const envSchema = z
    .object({
        APP_KEY: z.string().min(10, 'APP_KEY is required'),

        NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

        CLIENT_ID: z.coerce.number().int().positive(),
        CLIENT_SECRET: z.string().min(1, 'CLIENT_SECRET is required'),

        SKILLSETS_ANALYZER_URL: z
            .string()
            .min(1, 'SKILLSETS_ANALYZER_URL is required')
            .default(DEFAULT_ANALYZER_URL),

        LOG_OSU_API_REQUESTS: z
            .enum(['true', 'false'])
            .default('false')
            .transform((value) => value === 'true'),

        OSU_API_REQUESTS_IN_MINUTE: z.coerce.number().int().positive().default(60),
        OSU_API_REQUESTS_HIGH_WATER: z.coerce.number().int().positive().default(120),

        DB_HOST: z.string().min(1, 'DB_HOST is required'),
        DB_PORT: z.coerce.number().int().min(1).max(65535),
        DB_NAME: z.string().min(1, 'DB_NAME is required'),
        DB_USER: z.string().min(1, 'DB_USER is required'),
        DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
    })
    .superRefine((data, ctx) => {
        if (
            data.NODE_ENV === 'production' &&
            data.SKILLSETS_ANALYZER_URL === DEFAULT_ANALYZER_URL
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['SKILLSETS_ANALYZER_URL'],
                message: 'SKILLSETS_ANALYZER_URL must be configured explicitly in production',
            })
        }
    })

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
