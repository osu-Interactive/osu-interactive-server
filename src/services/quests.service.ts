import questsCategories from '@/config/quests-categories-seed'
import type { QuestModel } from '@/models/quest.model'

export default (questsModel: QuestModel) => ({
    async getUserQuests(userId: number, userPreferences: any) {
        console.log(userPreferences)
        //await this.getUserFavoriteSkillsets(userId)
    },

    generateQuest(userId: number) {},

    getQuestBeatmap(userId: number) {},

    async initQuestsCategories() {
        await questsModel.setQuestsCategories(questsCategories)
    },
})
