import { fileURLToPath } from 'node:url'
import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

import * as irl from 'irl'

const D = new irl.Database()

function main () {
  const rl = readline.createInterface({ input: stdin, output: stdout })

  loop(rl).then(() => process.exit(0))
}

async function loop (rl) {
  let go = true

  while (go) {
    const input = await rl.question('DB> ')

    try {
      go = interact(input) ?? true
    }
    catch (e) {
      if (e instanceof ParseError) {
        if (e.index === null) {
          console.error(e.message)
        }
        else {
          console.error(`Cannot parse at "${input.substr(e.index, 15)}": ${e.message}`)
        }
      }
      else {
        throw e
      }
    }
  }
}

/**
 * Perform single interaction with the user (prompt -> response).
 *
 * @return: undefined or true to continue, false to quit
 */
function interact (input) {
  if (input === 'quit') {
    return false
  }

  if (input === 'help') {
    console.log(
      [
        'Possible interactions:',
        '   DB> ?+ QUERY NAME | dim1: val1 dim2: val2 ... dimN: valN',
        '   DB> ?- dim1: val1 dim2: val2 ... dimN: valN',
        '   DB> + dim1: val1 dim2: val2 ... dimN: valN',
        '   DB> - dim1: val1 dim2: val2 ... dimN: valN',
        '   DB> dump',
        '   DB> help',
        '   DB> quit',
        '',
        'Values can be:',
        '  - _ (variable placeholder -- only for queries, not fact assertions)',
        '  - quoted strings ("string name")',
        '  - integers',
        '  - special names: true, false, null',
      ].join('\n')
    )
    return
  }

  if (input === 'dump') {
    irl.dumpDB(D)
    return
  }

  if (input.startsWith('+') || input.startsWith('-')) {
    const datum = parseDatum(input, 1)

    if (Object.values(datum).includes(irl.unbound)) {
      console.error('Cannot use variables in facts')
      return
    }

    if (input.startsWith('+')) {
      irl.assert(D, datum)
    }
    else {
      irl.retract(D, datum)
    }

    return
  }

  if (input.startsWith('?+')) {
    const { question, section } = parseQuestion(input, 2)

    irl.monitor(D, section, {
      onAdded (datum) {
        console.log('?', question, '+', datumAsString(datum))
      },
      onRemoved (datum) {
        console.log('?', question, '-', datumAsString(datum))
      }
    })

    return
  }

  if (input.startsWith('?-')) {
    const section = parseDatum(input, 2)
    irl.unmonitor(D, section)
    return
  }

  if (input.startsWith('?+') || input.startsWith('?-')) {
    const { question, section } = parseQuestion(input, 2)

    if (input.startsWith('?+')) {
      irl.monitor(D, section, {
        onAdded (datum) {
          console.log('?', question, '+', datumAsString(datum))
        },
        onRemoved (datum) {
          console.log('?', question, '-', datumAsString(datum))
        }
      })
    }
    else {
      irl.unmonitor(D, section)
    }

    return
  }

  console.error('Cannot understand your input, please repeat')
}

function parseQuestion (str, idx) {
  const idxPipe = str.indexOf('|', idx)

  if (idxPipe === -1) {
    throw new ParseError('Query does not have the pipe (|) character')
  }

  const section = parseDatum(str, idxPipe + 1)

  return {
    question: str.substring(idx, idxPipe).trim(),
    section,
  }
}

function parseDatum (str, idx) {
  const reDim = /(?<dim>[a-z]\w*):\s*((?<str>"[^"]*")|(?<num>[0-9]+)|(?<name>\w+))/diy
  const datum = {}

  for (;;) {
    // Skip all spaces
    while (idx < str.length && /\s/.test(str[idx])) {
      idx += 1
    }

    if (idx === str.length) {
      break
    }

    reDim.lastIndex = idx

    const mo = reDim.exec(str)

    if (mo === null) {
      throw new ParseError(idx)
    }

    if (Object.hasOwn(datum, mo.groups.dim)) {
      throw new ParseError(mo.indices.groups.dim[0], 'duplicate dimension')
    }

    let val

    if (mo.groups.str !== undefined) {
      val = JSON.parse(mo.groups.str)
    }
    else if (mo.groups.num !== undefined) {
      const int = Number.parseInt(mo.groups.num)

      if (String(int) !== mo.groups.num) {
        throw new ParseError(mo.indices.groups.num[0], 'cannot parse as integer')
      }

      val = int
    }
    else if (mo.groups.name !== undefined) {
      switch (mo.groups.name) {
        case 'true':
          val = true
          break

        case 'false':
          val = false
          break

        case 'null':
          val = null
          break

        case '_':
          val = irl.unbound
          break

        default:
          // console.dir(mo, { depth: 5 })
          throw new ParseError(mo.indices.groups.name[0], 'bad name')
      }
    }
    else {
      throw new Error()
    }

    datum[mo.groups.dim] = val
    idx = reDim.lastIndex
  }

  return datum
}

class ParseError extends Error {
  constructor (index, message = null) {
    if (arguments.length === 1) {
      message = index
      index = null
    }

    super(message ?? 'bad syntax')
    this.index = index
  }
}

function datumAsString (datum) {
  return [
    ...(function * () {
      for (const dim in datum) {
        yield dim
        yield ': '
        yield JSON.stringify(datum[dim])
        yield ' '
      }
    }())
  ].join('')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
