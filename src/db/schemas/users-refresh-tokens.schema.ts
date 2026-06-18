import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const usersRefreshTokens = pgTable('users_refresh_tokens', {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    tokenId: text('token_id').notNull(),
    tokenHash: text('token_hash').notNull(),

    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

