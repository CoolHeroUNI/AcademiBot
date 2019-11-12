class Archivo {
  /**
   * @param {String} Key
   */
  constructor (Key) {
    /**
     * Atributo que indica la ubicacion (ruta) del archivo en el sistema de archivos
     * @property Key
     * @type {String}
     */
    this.Key = Key;
  }
}
Archivo.prototype.equals = function (file) {
  return this.Key = file.Key;
};
/**
 * Metodo para obtener el nombre del archivo
 * @method getFileName
 * @returns {string}
 */
Archivo.prototype.getFilename = function () {
  const list = this.Key.split('/');
  return list[list.length - 1];
};
/**
 * Metodo para obtener la extension del archivo
 * @method getExtension
 * @returns {string}
 */
Archivo.prototype.getExtension = function () {
  const last = this.getFilename().split('-').pop();
  const dotIndex = last.lastIndexOf('.') + 1;
  if (dotIndex === 0) throw new Error("El archivo no posee una extension en " + this.Key);
  return last.substr(dotIndex);
};
/**
 * Metodo que retorna el tipo de archivo para su uso en Facebook
 * @method getType
 * @returns {String}
 */
Archivo.prototype.getType = function () {
  const extension = this.getExtension();
  const extensionesImagenes = ['jpg','png','jpeg','bmp'];
  if (extensionesImagenes.includes(extension))
    return 'image';
  const extensionesAudio = ['mp3','wav','wma','ogg'];
  if (extensionesAudio.includes(extension))
    return 'audio';
  const extensionesVideo = ['webm','avi','mp4','flv','3gp'];
  if (extensionesVideo.includes(extension))
    return 'video';
  return 'file';
};
Archivo.prototype.getKey = function () {
  return this.Key;
};
module.exports = Archivo;