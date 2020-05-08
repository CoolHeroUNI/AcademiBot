const CacheHandler = require("./classes/CacheHandler");
const cache = new CacheHandler(10000);

/**
 * Sorensen Dice coefficient implementation.
 * @param {String} s1
 * @param {String} s2
 */
function compare (s1, s2) {
  const searchString = s1 + " - * - " + s2;
  let result = cache.get(searchString);
  if (result) return result;
  if (s1 === s2) return 1;
  if (s1.length > s2.length) {
    let swap = s2;
    s2 = s1;
    s1 = swap;
  }
  let length1 = s1.length, length2 = s2.length;
  let i = 0, j = 0;

  const space = ' '.charCodeAt(0);
  const arr1 = new Int32Array(length1);
  const arr2 = new Int32Array(length2);
  let k = 0;
  while (i < length1 - 1) {
    const firstChar = s1.charCodeAt(i);
    const secondChar = s1.charCodeAt(++i);
    if (firstChar === space || secondChar === space) continue;
    arr1[k++] = (firstChar << 16) | secondChar;
  }
  length1 = k;
  k = 0;
  while (j < length2 - 1) {
    const firstChar = s2.charCodeAt(j);
    const secondChar = s2.charCodeAt(++j);
    if (firstChar === space || secondChar === space) continue;
    arr2[k++] = (firstChar << 16) | secondChar;
  }
  i = 0;
  length2 = k;
  k = 0;
  while (i < length1) {
    j = 0;
    while (j < length2) {
      if (arr1[i] === arr2[j++]) {
        k += 2;
      }
    }
    i++;
  }
  result = k / ( length1 + length2 );
  cache.set(searchString, result);
  return result;
}

module.exports = compare;