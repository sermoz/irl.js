import {fileURLToPath} from 'node:url'
import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

import * as irl from 'irl'
import {v} from 'irl'


const D = new irl.Database()


irl.assert(D.person("Serhii").isParentOf("Polina"))
irl.assert(D.person("Katya").isParentOf("Polina"))


function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  loop(rl).then(() => {
    console.log("Bye!")
  })
}

async function loop (rl) {
  for (;;) {
    const input = await rl.question("DB> ")

    if (input == 'quit') {
      return
    }

    if (input === 'help') {
      console.log(
        "Possible interactions:\n" +
        "   DB> ? dim1: arg1 dim2: arg2 ... dimN: argN\n" +
        "   DB> ! dim1: val dim2: val2 ... dimN: valN\n" +
        "   DB> help\n" +
        "   DB> dump\n" +
        "   DB> quit\n"
      )
      console.log("Arguments are either values or variables")
      console.log("Values are (quoted) strings, integers, 'true', 'false', 'null' (without apostrophes)")
      console.log("Variables are just unquoted names (except 'true', 'false', 'null')")
      continue
    }

    if (input === 'dump') {
      irl.dumpDB(D)
      continue
    }

    if (input.startsWith('!')) {
      // Assert some new fact into the system
      let args

      try {
        args = parseArgs(input)
      }
      catch (e) {
        if (e instanceof ParseError) {
          console.log(`Cannot parse at \"${input.substr(e.index, 15)}\"`)
          continue
        }

        throw e
      }

      irl.assertByArgs(D, args)
      continue
    }

    console.log("Cannot understand your input, please repeat")
  }
}

function parseArgs(str, idx=1) {
  const reArg = /(?<dim>[a-z]\w*):\s*((?<str>"[^"]*")|(?<num>[0-9]+)|(?<name>\w+))/iy
  const args = {}

  for (;;) {
    // Skip all spaces
    while (idx < str.length && /\s/.test(str[idx])) {
      idx += 1
    }

    if (idx === str.length) {
      break
    }

    reArg.lastIndex = idx

    const mo = reArg.exec(str)

    if (mo === null) {
      throw new ParseError(idx)
    }

    let val

    if (mo.groups.str !== undefined) {
      val = JSON.parse(mo.groups.str)
    }
    else if (mo.groups.num !== undefined) {
      const int = Number.parseInt(mo.groups.num)

      if (String(int) !== mo.groups.num) {
        throw new ParseError(idx, "cannot parse as integer")
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

        default:
          val = irl.internVar(mo.groups.name)
      }
    }
    else {
      throw new Error
    }

    args[mo.groups.dim] = val
    idx = reArg.lastIndex
  }

  return args
}


class ParseError extends Error {
  constructor (index, message=null) {
    super(message || "cannot parse")
    this.index = index
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
