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
  for (;;) {
    const input = await rl.question('DB> ')

    if (input === 'quit') {
      return
    }

    if (input === 'help') {
      console.log(
        [
          'Possible interactions:',
          '   DB> ? dim1: val1 dim2: val2 ... dimN: valN',
          '   DB> ! dim1: val1 dim2: val2 ... dimN: valN',
          '   DB> help',
          '   DB> dump',
          '   DB> quit',
          '',
          'Values can be:',
          '  - _ (variable placeholder)',
          '  - quoted strings ("string name")',
          '  - integers',
          '  - special names: true, false, null',
        ].join('\n')
      )
      continue
    }

    if (input === 'dump') {
      irl.dumpDB(D)
      continue
    }

    if (input.startsWith('!')) {
      const datum = parseDatum(input)

      if (datum !== null) {
        if (Object.values(datum).includes(irl.unbound)) {
          console.log('Cannot use variables in facts')
          continue
        }

        irl.assert(D, datum)
      }

      continue
    }

    if (input.startsWith('?')) {
      const args = parseDatum(input)

      if (args !== null) {
        irl.monitorProjection(D, args, {
          onAdded (datum) {
            console.log('+', datumAsString(datum))
          },
          onRemoved (datum) {
            console.log('-', datumAsString(datum))
          }
        })
      }

      continue
    }

    console.log('Cannot understand your input, please repeat')
  }
}

function parseDatum (str, idx = 1) {
  try {
    return doParseDatum(str, idx)
  }
  catch (e) {
    if (e instanceof ParseError) {
      console.log(`Cannot parse at "${str.substr(e.index, 15)}"`)
      return null
    }

    throw e
  }
}

function doParseDatum (str, idx) {
  const reDim = /(?<dim>[a-z]\w*):\s*((?<str>"[^"]*")|(?<num>[0-9]+)|(?<name>\w+))/iy
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
      throw new ParseError(idx, 'duplicate dimension')
    }

    let val

    if (mo.groups.str !== undefined) {
      val = JSON.parse(mo.groups.str)
    }
    else if (mo.groups.num !== undefined) {
      const int = Number.parseInt(mo.groups.num)

      if (String(int) !== mo.groups.num) {
        throw new ParseError(idx, 'cannot parse as integer')
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
          throw new ParseError(idx, 'bad name')
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
    super(message || 'cannot parse')
    this.index = index
  }
}

function datumAsString (datum) {
  return [
    ...(function * () {
      for (const dim in datum) {
        yield dim
        yield ': '
        yield datum[dim]
        yield ' '
      }
    }())
  ].join('')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
