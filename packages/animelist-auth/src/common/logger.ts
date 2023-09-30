
const warnOnceMessages = new Set()

/** 
 * @internal 
 * */
export function warnOnce(...message: unknown[]) {
    if (!warnOnceMessages.has(message[0])) {
        warnOnceMessages.add(message.join(' '))

        console.warn(...message)
    }
}
