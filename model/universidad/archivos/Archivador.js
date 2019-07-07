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
  let _archivos = archivos.map(dupla => [dupla[0], new Archivo(dupla[0]).carga(dupla[1])]);
  this.archivos = new Map(_archivos);
  /* let rutas = Object.getOwnPropertyNames(archivos);
  for (let ruta of rutas) {
    this.archivos[ruta] = new Archivo(ruta).carga(archivos[ruta]);
  } */
  /* 
  for (let archivo of archivos) {
    this.archivos[archivo.ruta] = new Archivo(archivo.ruta).carga(archivo);
  } */
};
/**
 * Metodo para obtener un Array de archivos simple
 * -05/12/19: Se opto por usar un Objeto de acceso aleatorio,
 * @method toJSON
 * @return {[String,{attachment_id:String,contador:Number}][]}
 */
Archivador.prototype.toJSON = function () {
  /* Se busca simplicidad
  let that = this;
  let valores = Object.keys(this.archivos).map(function (llave) {
    return that.archivos[llave];
  });
  return valores; */
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