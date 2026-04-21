import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const usersOauthTokens = pgTable('users_oauth_tokens', {
    id: serial('id').primaryKey(),

    user_id: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),

    access_token: text('access_token').notNull(),
    refresh_token: text('refresh_token').notNull(),

    expires_at: timestamp('expires_at').notNull(),

    created_at: timestamp('created_at').defaultNow().notNull()
})
