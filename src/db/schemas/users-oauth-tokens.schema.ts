import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const usersOauthTokens = pgTable('users_oauth_tokens', {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),

    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),

    expiresAt: timestamp('expires_at').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
