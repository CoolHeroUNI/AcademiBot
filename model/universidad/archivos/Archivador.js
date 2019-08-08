const Archivo = require('./Archivo');
/**
 * Clase encargada de almacenar y cargar los archivos que seran usados por
 * el ChatBot, asi como de generar las estructuras pertinentes para encontrar 
 * eficientemente un archivo
 * @class Archivador
 * @constructor
 */
class Archivador {
  constructor() {
    /**
     * Objeto donde se guarda los objetos {Archivo}, posee acceso aleatorio,
     * el indice de un objeto {Archivo} sera su propia ruta absoluta en el
     * directorio, incluyendo extension
     * @property {Map} archivos 
     * @type {Map<String,Archivo>}
     */
    this.archivos = new Map();
  }
}
/**
 * Metodo que devuelve el tamaño del archivador
 * @method size
 * @returns {number}
 */
Archivador.prototype.size = function () {
  return this.archivos.size;
};
/**
 * Metodo para añadir un archivo y devuelve una referencia a este
 * @method creaArchivo
 * @param {String} ruta
 * @returns {Archivo}
 */
Archivador.prototype.creaArchivo = function (ruta) {
  this.archivos.set(ruta, new Archivo(ruta));
  return this.archivos.get(ruta);
};
/**
 * Metodo para eliminar archivos
 * @method eliminaArchivo
 * @param {String} ruta
 * @returns {Boolean}
 */
Archivador.prototype.eliminaArchivo = function (ruta) {
  return this.archivos.delete(ruta);
}
/**
 * Metodo para proporcionar un codigo de reusabilidad a un
 * archivo
 * @method setReusabilidad
 * @param {String} ruta
 * @param {String} codigo
 */
Archivador.prototype.setReusabilidad = function (ruta, codigo) {
  this.archivos.get(ruta).setAttachmentId(codigo);
};
/**
 * Metodo para cargar desde JSON
 * -12/05/19 Se opto por cargar todo el Objeto
 * @method cargaArchivos
 * @param {[String,{attachment_id:String,contador:Number}][]} archivos
 */
Archivador.prototype.cargaArchivos = function (archivos) {
  let _archivos = archivos.map(archivo => [archivo[0], new Archivo(archivo[0]).carga(archivo[1])]);
  this.archivos = new Map(_archivos);
};
/**
 * Metodo que devuelve un Array con los elementos del Archivador
 * @method toArray
 * @returns {Archivo[]}
 */
Archivador.prototype.toArray = function () {
  return Array.from(this.archivos.values());
}
/**
 * Metodo para obtener un Array de archivos simple
 * -05/12/19: Se opto por usar un Objeto de acceso aleatorio,
 * @method toJSON
 * @return {[String,{attachment_id:String,contador:Number}][]}
 */
Archivador.prototype.toJSON = function () {
  return Array.from(this.archivos.entries()).map(elem => [elem[0], elem[1].toJSON()]);
};
/**
 * Metodo para obtener un Objeto archivo a partir de su ruta
 * @method getArchivo
 * @param {String} ruta
 * @return {Archivo}
 */
Archivador.prototype.getArchivo = function (ruta) {
  let archivo = this.archivos.get(ruta);
  archivo = archivo ? archivo : this.creaArchivo(ruta);
  archivo.aumentaContador();
  return archivo;
};
module.exports = Archivador;