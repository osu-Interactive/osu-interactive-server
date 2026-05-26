import readline from 'node:readline'
import type { FastifyInstance } from 'fastify'
import Commands from './commands'

function isCommand(cmd: string, commands: ReturnType<typeof Commands>): cmd is keyof typeof commands {
    return cmd in commands
}

export function initCommands(app: FastifyInstance) {
    const commands = Commands(app)

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    })

    rl.on('line', async (input: string) => {
        const args = input.trim().split(/\s+/)

        const rawCommand = args[0]
        const command = rawCommand?.startsWith('/')
            ? rawCommand.slice(1)
            : rawCommand

        const commandArgs: (string | number)[] = args.slice(1).map((arg) => {
            const num = Number(arg)
            return isNaN(num) ? arg : num
        })

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
