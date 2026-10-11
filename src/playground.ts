import { FastifyInstance } from 'fastify'

export default (async (app: FastifyInstance) => {
    await app.services.quests.generateUserQuests(
        //@ts-ignore
        [{ jumps: 930249 }],
        {
            name: 'Expert',
            code: 5,
            minPP: 5000,
            maxPP: 7000,
        },
        app.services.beatmap.getBMComboDifficulty,
    )
})
