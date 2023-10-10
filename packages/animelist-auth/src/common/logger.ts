function getWarnOnceMessages() {
  const globalWithWarnOnceMessage = globalThis as { warnOnceMessages?: Set<unknown> };

  if (globalWithWarnOnceMessage.warnOnceMessages) {
    return globalWithWarnOnceMessage.warnOnceMessages;
  }

  globalWithWarnOnceMessage.warnOnceMessages = new Set();
  return globalWithWarnOnceMessage.warnOnceMessages;
}

/**
 * @internal
 * */
export function warnOnce(...message: unknown[]) {
  const warnOnceMessages = getWarnOnceMessages();

  if (!warnOnceMessages.has(message[0])) {
    warnOnceMessages.add(message.join(" "));

    console.warn(...message);
  }
}
