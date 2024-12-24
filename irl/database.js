function Database () {
  this.predicates = []
}

/**
 * import { v } from 'irl'
 * 
 * const D = new Database()
 * 
 * irl.assert(D.person("Vova").isParentOf("Serhii"))
 *
 * irl.assert([
 *   D.person("Serhii").isParentOf("Polina"),
 *   D.person("Katya").isParentOf("Polina"),
 *   D.person("Yura").isParentOf("Katya"),
 *   D.person("Vova").isParentOf("Serhii")
 * ])
 * 
 * // Inference:
 * irl.assert(
 *   D.person(v`Child`).isChildOf(v`Parent`),
 *   irl.all(
 *     D.person(v`Parent`).isParentOf(v`Child`)
 *   )
 * )
 *
 */

