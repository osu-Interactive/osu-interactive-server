import type { QuestCategory } from '@/types/osu.types'

export default [
    {
        name: 'Beginner',
        code: 1,
        minPP: 0,
        maxPP: 1000,
    },
    {
        name: 'Intermediate',
        code: 2,
        minPP: 1000,
        maxPP: 2000,
    },
    {
        name: 'Experienced',
        code: 3,
        minPP: 2000,
        maxPP: 3500,
    },
    {
        name: 'Advanced',
        code: 4,
        minPP: 3500,
        maxPP: 5000,
    },
    {
        name: 'Expert',
        code: 5,
        minPP: 5000,
        maxPP: 7000,
    },
    {
        name: 'Master',
        code: 6,
        minPP: 7000,
        maxPP: 10000,
    },
    {
        name: 'Legend',
        code: 7,
        minPP: 10000,
        maxPP: null,
    },
] satisfies readonly QuestCategory[]
