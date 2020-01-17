const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
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
  const texto = (" " + this).slice(1);
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
      randomPing(url, timeout, variance);
      return rp.get(url);
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

/**
 *
 * @param {String} timeString
 * @param {Number} n
 * @returns {String}
 */
function averageTime(timeString, n) {
  const currentTime = moment(new Date().toTimeString().split(" ")[0], "HH:mm:ss").valueOf();
  const anteriorHoraPromedio = moment(timeString, "HH:mm:ss").valueOf();
  return new Date((n * anteriorHoraPromedio + currentTime) / (n + 1)).toTimeString().split(" ")[0];
}
module.exports = { randomPing, wait, moduleLoad, averageTime };