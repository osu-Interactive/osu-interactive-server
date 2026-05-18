import readline from 'node:readline'
import commands from './commands'

export function initCommands() {
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
        const commandArgs = args.slice(1)

        if (!command) return

        const handler = commands[command]

        if (!handler) {
            console.log(`Unknown command: ${command}`)
            return
        }

        try {
            await handler(...commandArgs)
        } catch (error) {
            console.error(`Command "${command}" failed:`, error)
        }
    })

    return rl
}
