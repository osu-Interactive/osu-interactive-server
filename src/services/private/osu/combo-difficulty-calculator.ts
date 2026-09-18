import RosuBeatmapWrapper from "@/services/private/osu/rosu-beatmap-wrapper";

const comboDifficultyCalculator = () => ({
    async getBMComboPP(beatmapId: number) {
        const beatmap = await RosuBeatmapWrapper.create(beatmapId)
        const calculatedBeatmap = beatmap.calculate({ mods: 'CL' })

        console.log(RosuBeatmapWrapper.map(calculatedBeatmap))
    }
})

export default comboDifficultyCalculator
