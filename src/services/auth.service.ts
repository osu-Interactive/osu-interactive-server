import { LoginWithOsu } from '@/services/login-with-osu.service'
import type { DB } from '@/types/drizzle-pg-db.types'

export function getOsuApiAuthLink(state: string) {
    const osuApiClientId: string = String(process.env.CLIENT_ID)

    return (
        'https://osu.ppy.sh/oauth/authorize' +
        `?client_id=${osuApiClientId}` +
        '&redirect_uri=http://localhost:5173/login' +
        '&response_type=code' +
        '&scope=public+identify' +
        `&state=${state}`
    )
}

export async function loginWithOsu(db: DB, osuApiCode: string) {
    const loginWithOsu = new LoginWithOsu(db)
    return await loginWithOsu.execute(osuApiCode)
}
