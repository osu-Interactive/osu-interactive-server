import OsuApiUserClient from '@/infrastructure/osu-api/osu-api-user-client'
import { userModel, type UserModel } from '@/models/user.model'
import type { DB, DBExecutor } from '@/types/drizzle-pg-db.types'
import type { DBUser, OsuApiUser, OsuUserExtracted } from '@/types/osu.types'

type UserModelFactory = (db: DBExecutor) => UserModel

export class LoginWithOsu {
    constructor(
        private readonly db: DB,
        private readonly makeUserModel: UserModelFactory = userModel,
        private readonly osuApi: OsuApiUserClient = new OsuApiUserClient(),
    ) {}

    //TODO: Test the transaction
    async execute(userOsuApiCode: string): Promise<DBUser> {
        const { authResult, extractedData } = await this.fetchOsuUser(userOsuApiCode)

        return this.db.transaction(async (tx) => {
            const users = this.makeUserModel(tx)
            let user = await users.getByOsuId(extractedData.id)

            if (user) {
                await users.updateById(user.id, extractedData)
            } else {
                user = await users.upsertFromOsu(extractedData)
            }

            await users.saveToken(user.id, authResult)

            return user
        })
    }

    private async fetchOsuUser(userOsuApiCode: string) {
        const authResult = await this.osuApi.fetchAccessTokenCodeGrant(userOsuApiCode)
        const userData = await this.osuApi.getUserDataFromOsuApi(authResult.token)

        return {
            authResult,
            extractedData: this.extractUserData(userData),
        }
    }

    private extractUserData(raw: OsuApiUser): OsuUserExtracted {
        return {
            id: raw.id,
            username: raw.username,
            avatar_url: raw.avatar_url,
            country: {
                code: raw.country.code,
                name: raw.country.name,
            },
            pp: raw.statistics.pp,
        }
    }
}
