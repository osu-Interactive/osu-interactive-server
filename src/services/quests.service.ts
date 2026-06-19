import questsCategories from '@/config/quests-categories-seed'
import type { QuestModel } from '@/models/quest.model'

export default (questsModel: QuestModel) => ({
    async initQuestsCategories() {
        await questsModel.setQuestsCategories(questsCategories)
    }
})


