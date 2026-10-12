import user from './user/user.module'
import quests from './quests/quests.module'
import beatmaps from './beatmaps/beatmaps.module'
import survey from './survey/survey.module'
import tags from './tags/tags.module'

import type { DB } from '@/shared/types/db.types'

export const buildModules = (db: DB) => ({
    user: user(db),
    quests: quests(db),
    beatmaps: beatmaps(db),
    survey: survey(db),
    tags: tags(db),
})
