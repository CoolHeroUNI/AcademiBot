const https = require('https');
const fs = require('fs');
const path = require('path');
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
 * @method removeTildesLower
 * @returns {String}
 */
String.prototype.removeTildesLower = function () {
  let texto = (" " + this).slice(1);
  let tildes   = 'áàéèíìóòúüùñ';
  let normales = 'aaeeiioouuun';
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
/**
 * Metodo para quitar toda ocurrencia de caracter especial de una cadena
 * @param {String} literal
 * @returns {String}
 */
RegExp.escape = function (literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 *
 * @param {Number} timeout
 * @returns {Promise<always>}
 */
function wait (timeout) {
  return new Promise((resolve => setTimeout(resolve, timeout)));
}

/**
 * Envia un ping a url con tiempo aleatorio entre 10-15 minutos
 * @param {String} url
 * @param {Number} timeout
 * @param {Number} variance
 */
function randomPing (url, timeout, variance = 5000) {
  const options = new URL(url);
  options.method = 'HEAD';
  timeout = Math.floor((Math.random() * 2 * variance) - variance + timeout);
  wait(timeout)
    .then(() => {
      console.log('Ping to ' + url);
      https.request(options);
      randomPing(url, timeout, variance);
    })
    .catch(e => console.error(e));
}

/**
 *
 * @param {String} folderName
 * @returns {Array<any>}
 */
function moduleLoad(folderName) {
  let modules = [];
  fs.readdirSync(folderName).forEach(file => {
    const fullName = path.join(folderName, file);
    const objStat = fs.lstatSync(fullName);
    const dir = path.isAbsolute(fullName) ? fullName : path.join(__dirname, fullName);
    if (objStat.isDirectory()) {
      const subModules = moduleLoad(path.join(dir));
      modules = modules.concat(subModules);
    } else if (fullName.toLowerCase().indexOf('.js') + 1 && fullName.toLowerCase().indexOf('index.js') === -1) {
      const module = require(dir);
      modules.push(module);
    }
  });
  return modules;
}
module.exports = { randomPing, wait, moduleLoad };