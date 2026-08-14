export const skillsetsSeed = [
    {
        name: 'Jumps',
        code: 'jumps',
        surveyDescription: 'Do you enjoy flicking your mouse or tablet pen quickly between notes?',
    },

    {
        name: 'Streams',
        code: 'streams',
        surveyDescription: 'How about hitting long sequences of fast notes in a row?',
    },

    {
        name: 'Finger Control',
        code: 'fingerControl',
        surveyDescription:
            'Do you enjoy mechanically challenging patterns, such as bursts followed by a single note?',
    },

    {
        name: 'Alternate',
        code: 'alternate',
        surveyDescription:
            'Do you enjoy slower but wide-flowing patterns that require alternating between both fingers at a steady rhythm?',
    },

    {
        name: 'Tech',
        code: 'tech',
        surveyDescription:
            'What do you think about large, sweeping sliders and rapidly switching between them?',
    },

    {
        name: 'Gimmick',
        code: 'gimmick',
        surveyDescription:
            'Do you enjoy unusual patterns that don’t clearly fit into either streams or jumps?',
    },
] as const

export type Skillset = (typeof skillsetsSeed)[number]['code']
