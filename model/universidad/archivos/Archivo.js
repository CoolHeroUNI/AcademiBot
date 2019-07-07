/**
 * Clase que modela el comportamiento del archivo, tiene 
 * como propiedades una ruta absoluta de S3
 * @class Archivo
 */
class Archivo {
  /**
   * @constructor
   * @param {String} ruta 
   */
  constructor (ruta) {
    let index = ruta.indexOf(".");
    let ext = ~index ? ruta.substr(index + 1) : "";
    /**
     * Ruta del archivo segun el directorio del bucket en S3
     * @property {String} ruta 
     */
    this.ruta = ruta;
    /**
     * Extension del archivo para manejar su envio con mayor
     * facilidad
     * @property {String} extension
     */
    this.extension = ext;
    /**
     * Codigo de reusabilidad para Facebook
     * @property {String} attachment_id 
     */
    this.attachment_id = "";
    /**
     * Cantidad de veces que el archivo es obtenido
     * @property {Number} contador
     */
    this.contador = 0;
  }
}
/**
 * Metodo para obtener el attachment_id
 * @method getAttachmentId
 * @returns {String}
 */
Archivo.prototype.getAttachmentId = function () {
  return this.attachment_id;
};
/**
 * Metodo para añadir el campo de attachment_id
 * @method setAttachmentId
 * @param {String} id
 */
Archivo.prototype.setAttachmentId = function (id) {
  this.attachment_id = id;
};
/**
 * Metodo para comprobar si se puede reusar el archivo mediante
 * la API de Facebook
 * @method esReusable
 * @return {Boolean}
 */
Archivo.prototype.esReusable = function () {
  return this.attachment_id !== "";
};
/**
 * Metodo para cargar a partir de un objeto con propiedades
 * attachment_id y contador
 * @method carga
 * @param {{attachment_id:String,contador:Number}} archivo
 * @returns {Archivo} el contexto this
 */
Archivo.prototype.carga = function (archivo) {
  this.setAttachmentId(archivo.attachment_id);
  this.setContador(archivo.contador);
  return this;
};
/**
 * Metodo para obtener la extension de un archivo
 * @method getExtension
 * @return {String}
 */
Archivo.prototype.getExtension = function () {
  return this.extension;
};
/**
 * Metodo para obtener la ruta
 * @method getRuta
 * @return {String}
 */
Archivo.prototype.getRuta = function () {
  return this.ruta;
};
/**
 * Metodo para obtener el contador de ocurrencias de solicitud
 * @method getContador
 * @return {Number}
 */
Archivo.prototype.getContador = function () {
  return this.contador;
};
/**
 * Metodo que aumenta el contador de ocurrencias
 * @method aumentaContador
 */
Archivo.prototype.aumentaContador = function () {
  this.contador++;
};
/**
 * Metodo para establecer el contador en una cantidad anterior
 * @method setContador
 * @param {Number} numero
 */
Archivo.prototype.setContador = function (numero) {
  this.contador = numero;
};
/**
 * Metodo para convertir el archivo a JSON obteniendo su
 * contador y attachment_id
 * @method toJSON
 * @returns {{attachment_id:String,contador:Number}}
 */
Archivo.prototype.toJSON = function () {
  return {
    attachment_id: this.attachment_id,
    contador: this.getContador()
  };
};
/**
 * Metodo que retorna el tipo de archivo
 * @method getType
 * @returns {String}
 */
Archivo.prototype.getType = function () {
  let existe;
  const extensionesImagenes = ["jpg","png","jpeg","bmp"];
  existe = extensionesImagenes.includes(this.getExtension());
  if (existe) return 'image';
  const extensionesAudio = ["mp3","wav","wma","ogg"];
  existe = extensionesAudio.includes(this.getExtension());
  if (existe) return 'audio';
  const extensionesVideo = ["webm","avi","mp4","flv","3gp"];
  existe = extensionesVideo.includes(this.getExtension());
  if (existe) return 'video';
  return 'file';
};
module.exports = Archivo;