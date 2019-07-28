const http = require("http");
/**
 * Envia un ping a url con tiempo aleatorio entre 10-15 minutos
 * @param {String} url
 */
function randomPing (url) {
  const tiempo = Math.floor(1000*(60*(Math.random() * 5 + 10)));
  setTimeout(() => {
    http.get(url);
    randomPing(url);
  }, tiempo);
}
module.exports = randomPing;