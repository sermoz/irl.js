export function check (condition, message) {
  if (!condition) {
    throw new Error(
      typeof message === 'string'
        ? message
        : typeof message === 'function'
          ? message()
          : 'Check failed'
    )
  }
}
