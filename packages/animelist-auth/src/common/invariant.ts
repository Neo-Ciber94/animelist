/**
 * Ensure a condition is true.
 *
 * @internal
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
