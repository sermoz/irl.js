import * as irl from 'irl'
import { v } from 'irl'

const DB = new irl.Database()

// How would clauses with bodies look?
irl.assert(DB.person(v`Aunt`).isAuntOf(v`Person`))
  .when(
    DB.person(v`Aunt`).sex('woman'),
    DB.person(v`Aunt`).sibling(v`Sib`),
    DB.person(v`Sib`).isParentOf(v`Person`)
  )


irl.assert({
  what: DB.person(v`Aunt`).isAuntOf(v`Person`)),
  when: irl.all(
    DB.person(v`Aunt`).sex('woman'),
    DB.person(v`Aunt`).sibling(v`Sib`),
    DB.person(v`Sib`).isParentOf(v`Person`)
  )
})
