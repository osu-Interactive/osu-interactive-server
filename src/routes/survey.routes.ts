import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authMiddleware } from '@/middlewares/auth.middleware'
import TagsService from '@/services/tags.service'
import SurveyApplication from '@/application/survey.application'
import { codes as SkillsetCodes } from '@/config/seeds/skillsets-seed'
import { codes as ModsCodes } from '@/config/seeds/mods-seed'
import { ZodTypeProvider } from '@fastify/type-provider-zod'

const surveySchema = z.object({
    skillsetsCodes: z
        .array(z.enum(SkillsetCodes))
        .min(1)
        .refine((items) => new Set(items).size === items.length, {
            message: 'Elements must be unique',
        }),

    modsCodes: z.array(z.enum(ModsCodes)).refine((items) => new Set(items).size === items.length, {
        message: 'Elements must be unique',
    }),
})

export type SurveyClientData = z.infer<typeof surveySchema>

export default async function surveyRoutes(app: FastifyInstance) {
    const tagsService = new TagsService(app.models.tags)
    const surveyApplication = new SurveyApplication(app)

    app.get('/', async () => {
        return {
            skillsets: await tagsService.getSkillsets(),
            mods: await tagsService.getMods(),
        }
    })

    app.withTypeProvider<ZodTypeProvider>().post(
        '/save',
        { schema: { body: surveySchema }, preHandler: authMiddleware },
        async (request, _) => {
            const surveyData = request.body

            const userId = request.user.id

            await surveyApplication.saveSurvey(userId, surveyData)
        },
    )

    // app.post('/save', { preHandler: authMiddleware }, async (request, _) => {
    //     //TODO: Validate client data
    //     const surveyData = request.body as SurveyResult
    //
    //     const userId = request.user.id
    //
    //     await surveyApplication.saveSurvey(userId, surveyData)
    // })
}
