import SurveyServiceClass from '@/services/survey.service'
import QuestsServiceFactory from '@/services/quests.service'

export type SurveyService = InstanceType<typeof SurveyServiceClass>
export type QuestsService = ReturnType<typeof QuestsServiceFactory>
