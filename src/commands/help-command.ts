import chalk from 'chalk'
import type { Commands } from './commands'

export default function (commands: Commands) {
    console.log(
        chalk.red.bold(
            '\n  ⚠ WARNING: A running command cannot be stopped early without shutting down the server.\n',
        ),
    )

    console.log(
        chalk.red.green(
            '  Some commands support filtering beatmaps using the optional "extraCondition" argument.\n' +
                '  It works by comparing database table fields against the provided values.\n' +
                "  Supported comparison operators: '>', '>=', '=', '<=', '<', '!='.\n" +
                '  To specify multiple conditions, join them using the "AND" keyword (case-insensitive).\n' +
                '  Example: "combo >= 300 AND mode = osu".\n',
        ),
    )
    const entries = Object.entries(commands).filter(
        ([command, handler]) =>
            command !== 'help' &&
            typeof handler === 'object' &&
            handler !== null &&
            'description' in handler,
    )

    console.log(chalk.gray(`  ${entries.length} commands available:\n`))

    for (const [command, handler] of entries) {
        const data = handler as {
            description: string
            arguments?: {
                name?: string
                description?: string
                required?: boolean
            }[]
            example?: string
        }

        console.log(chalk.cyan('  ❯ ') + chalk.bold.white(`/${command}\n`))

        console.log(wrapText(highlightNumbers(data.description)))

        if (data.arguments?.length) {
            console.log(chalk.blue('    Arguments:'))

            for (const arg of data.arguments) {
                const name = arg.name ?? 'argument'
                const required = arg.required ? chalk.red(' (required)') : chalk.gray(' (optional)')

                console.log(
                    `       ${chalk.white(name)}${required}` +
                        (arg.description ? chalk.gray(` — ${arg.description}`) : ''),
                )
            }
        }

        if (data.example) {
            console.log(chalk.blue('    Example: ') + highlightNumbers(data.example))
        }

        console.log(chalk.gray('    ' + '─'.repeat(48)))
    }

    console.log()
}

const highlightNumbers = (text: string) =>
    text.replace(/(["'`])(?:\\.|(?!\1)[^\\])*?\1|\b\d+(?:\.\d+)?\b/g, (match) => {
        if (/^["'`]/.test(match)) {
            return chalk.green(match)
        }

        return chalk.yellow(match)
    })

const wrapText = (text: string, width = 160, indent = '    ') => {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let line = ''

    for (const word of words) {
        if (line && line.length + word.length + 1 > width) {
            lines.push(line)
            line = word
        } else {
            line += (line ? ' ' : '') + word
        }
    }

    if (line) lines.push(line)

    return lines.map((line) => `${indent}${line}`).join('\n')
}
