import {fileURLToPath} from 'node:url'
import * as irl from 'irl'



const D = new irl.Database()


irl.assert(D.person("Serhii").isParentOf("Polina"))
irl.assert(D.person("Katya").isParentOf("Polina"))


function main() {
  irl.dumbDB(D)
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
