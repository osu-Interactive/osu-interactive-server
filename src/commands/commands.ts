export type Command = (...args: string[]) => void | Promise<void>

const commands: Record<string, Command> = {
    'test-command': () => {
        console.log('works')
    },
}

export default commands
