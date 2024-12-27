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

export function arraysEqual (A, B) {
  if (A.length !== B.length) {
    return false
  }

  const size = A.length

  for (let i = 0; i < size; i += 1) {
    if (A[i] !== B[i]) {
      return false
    }
  }

  return true
}

export function dumbFunc (props) {
  const func = () => null

  delete func.name
  delete func.length

  return Object.assign(func, props)
}
