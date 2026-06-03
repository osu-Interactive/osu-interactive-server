import type {DB, DBExecutor} from "@/types/drizzle-pg-db.types";
import { surveyModel } from "@/models/survey.model";

type SurveyModelFactory = (db: DBExecutor) => ReturnType<typeof surveyModel>

interface SurveyResult {
    skillsets: number[]
    mods: number[]
}

export class SurveyService {
    constructor(
        private readonly db: DB,
        private readonly makeSurveyModel: SurveyModelFactory = surveyModel,
    ) {}

    async save(userId: number, survey: SurveyResult) {
        return this.db.transaction(async (tx) => {
            const surveyModel = this.makeSurveyModel(tx)

            await surveyModel.deleteAllUserMods(userId)
            await surveyModel.deleteAllUserSkillsets(userId)

            if (survey.mods.length > 0) {
                const userMods: any =
                        survey.mods.map((modId) => ({
                        userId,
                        modId,
                    }))

                await surveyModel.insertUserMods(userMods)
            }

            if (survey.skillsets.length > 0) {
                const userSkillsets: any = survey.skillsets.map(
                    (skillsetId) => ({
                        userId,
                        skillsetId,
                    }),
                )

                await surveyModel.insertUserSkillsets(userSkillsets)
            }
        })
    }
}
