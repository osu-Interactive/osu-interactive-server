import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const usersRefreshTokens = pgTable('users_refresh_tokens', {
    id: serial('id').primaryKey(),

    user_id: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    token_id: text('token_id').notNull(),
    token_hash: text('token_hash').notNull(),

    expires_at: timestamp('expires_at').notNull(),
    revoked_at: timestamp('revoked_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
})

