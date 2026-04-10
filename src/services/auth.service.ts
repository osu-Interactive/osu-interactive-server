export function getOsuApiAuthLink() {
    const osuApiClientId: string = String(process.env.CLIENT_ID)

    return (
        'https://osu.ppy.sh/oauth/authorize' +
        `?client_id=${osuApiClientId}` +
        '&redirect_uri=http://localhost:5173/login' +
        '&response_type=code' +
        '&scope=public+identify' +
        '&state=randomval'
    )
}

export function login() {
    return { token: 'some_token_example', userName: 'Mock' }
}
