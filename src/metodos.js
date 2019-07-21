/**
 * Metodo estatico para la clase arreglo, sera usada para 
 * barajar los elementos de un arreglo implementando el
 * "Fisher-Yates Shuffle Algorithm" 
 * http://Bost.Ocks.org/mike/shuffle/
 * @method shuffle
 * @param {Array} array arreglo a ser barajado
 * @param {Boolean} [modify] si se modifica el arreglo
 * @returns {Array}
 */
Array.shuffle = function (array, modify) {
  array = modify ? array : array.slice();
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};
/**
 * Metodo de la clase array para obtener un elemento aleatorio
 * @method random
 * @returns {*} elemento aleatorio
 */
Array.prototype.random = function () {
  let rand = Math.random();
  return this[Math.floor(rand * this.length)];
};
/**
 * Metodo para limpiar las cadenas de mayusculas y de tildes
 * @method limpia
 * @returns {String}
 */
String.prototype.limpia = function () {
  let texto = (" " + this).slice(1);
  let tildes = 'áàéèíìóòúüù';
  let normales = 'aaeeiioouuu';
  let aux = texto.toLowerCase();
  let res = '';
  for (let i = 0; i < aux.length; i++) {
    const letter = aux.charAt(i);
    let aux2 = tildes.indexOf(letter);
    if (aux2 > -1) {
      res += normales[aux2];
    } else {
      res += letter;
    }
  }
  return res;
};

module.exports = {};