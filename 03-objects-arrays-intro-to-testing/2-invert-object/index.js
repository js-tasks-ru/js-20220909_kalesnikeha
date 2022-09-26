/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) return;
  let newObj = {};
  for (const item in obj) {
    let newProp = obj[item];
    newObj[newProp] = item;
  }
  return newObj;
}
