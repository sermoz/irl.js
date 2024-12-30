const variables = Object.create(null)

export function internVar (name) {
  let v = variables[name]

  if (v === undefined) {
    v = variables[name] = new Var(name)
  }

  return v
}


/**
 * This is what's exported as "v", as in: v`Person`
 */
export function tagVar (parts) {
  if (parts.length > 1) {
    throw new Error("Variable names don't support interpolation")
  }

  const [name] = parts
  return internVar(name)
}

export function Var (name) {
  this.name = name
}
