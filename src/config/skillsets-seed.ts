export const skillsetsSeed = {
    jumps: {
        name: 'Jumps',
        surveyDescription:
            'Do you enjoy flicking your mouse or tablet pen quickly between notes?',
    },

    streams: {
        name: 'Streams',
        surveyDescription:
            'How about hitting long sequences of fast notes in a row?',
    },

    finger_control: {
        name: 'Finger Control',
        surveyDescription:
            'Do you enjoy mechanically challenging patterns, such as bursts followed by a single note?',
    },

    alt: {
        name: 'Alternate',
        surveyDescription:
            'Do you enjoy slower but wide-flowing patterns that require alternating between both fingers at a steady rhythm?',
    },

    tech: {
        name: 'Tech',
        surveyDescription:
            'What do you think about large, sweeping sliders and rapidly switching between them?',
    },

    reading: {
        name: 'Reading',
        surveyDescription:
            'Do you enjoy playing low AR maps and accurately reading overlapping or difficult-to-read patterns?',
    },

    gimmick: {
        name: 'Gimmick',
        surveyDescription:
            'Do you enjoy unusual patterns that don’t clearly fit into either streams or jumps?',
    },
} as const
