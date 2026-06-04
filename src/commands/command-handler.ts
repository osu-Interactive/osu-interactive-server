import readline from 'node:readline'
import type { FastifyInstance } from 'fastify'
import Commands from './commands'

function isCommand(cmd: string, commands: ReturnType<typeof Commands>): cmd is keyof typeof commands {
    return cmd in commands
}

function parseCommandArgs(input: string) {
    const args: string[] = []
    let currentArg = ''
    let currentQuote: '"' | "'" | null = null
    let isEscaped = false
    let hasArg = false

    for (const char of input.trim()) {
        if (isEscaped) {
            currentArg += char
            isEscaped = false
            hasArg = true
            continue
        }

        if (currentQuote) {
            if (char === '\\') {
                isEscaped = true
                continue
            }

            if (char === currentQuote) {
                currentQuote = null
                continue
            }

            currentArg += char
            hasArg = true
            continue
        }

        if (char === '"' || char === "'") {
            currentQuote = char
            hasArg = true
            continue
        }

        if (/\s/.test(char)) {
            if (hasArg) {
                args.push(currentArg)
                currentArg = ''
                hasArg = false
            }

            continue
        }

        currentArg += char
        hasArg = true
    }

    if (isEscaped) {
        currentArg += '\\'
    }

    if (currentQuote) {
        throw new Error(`Unclosed ${currentQuote} quote`)
    }

    if (hasArg) {
        args.push(currentArg)
    }

    return args
}

function parseCommandArgValue(arg: string) {
    if (!arg.trim()) {
        return arg
    }

    const num = Number(arg)
    return isNaN(num) ? arg : num
}

export function initCommands(app: FastifyInstance) {
    const commands = Commands(app)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    })

    rl.on('line', async (input: string) => {
        let args: string[]

        try {
            args = parseCommandArgs(input)
        } catch (error) {
            console.error(`Invalid command syntax: ${(error as Error).message}`)
            return
        }

        const rawCommand = args[0]
        const command = rawCommand?.startsWith('/')
            ? rawCommand.slice(1)
            : rawCommand

        const commandArgs: (string | number)[] = args.slice(1).map(parseCommandArgValue)

        if (!command) return

        if (!isCommand(command, commands)) {
            console.log(`Unknown command: ${command}`)
            return
        }

        const handler = commands[command]

        try {
            await (handler as (...args: (string | number)[]) => Promise<void>)(...commandArgs)
        } catch (error) {
            console.error(`Command "${command}" failed:`, error)
        }
    })

    return rl
}
