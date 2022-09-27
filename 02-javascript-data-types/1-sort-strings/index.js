/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortedArr = [...arr];

  return sortedArr.sort((a, b) => {
    const options = {
      sensitivity: "case",
      caseFirst: "upper",
    };
    return param === "asc" ? a.localeCompare(b, "ru-en", options) : b.localeCompare(a, "ru-en", options);
  });
}
