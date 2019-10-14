class FileStorage {
    constructor() {
        const methods = [
            "listObjectsUnder",
            "listObjectsDirectlyUnder",
            "getObject",
            "putObject",
            "copyObject",
            "moveObject",
            "deleteObject",
            "renameObject",
            "getPublicURL"
        ];

        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}

/**
 * @method listObjectsUnder
 * Metodo para listar los objetos cuya clave tenga un prefijo determinado, esto puede traducirse a listar los objetos
 * bajo cierta carpeta, devuelve una lista de las claves de dichos objetos
 * @param {String} prefix
 */
FileStorage.prototype.listObjectsUnder = function(prefix) {};

/**
 * @method listObjectsDirectlyUnder
 * Metodo para listar los objetos cuya clave tenga un prefijo determinado y hasta la aparicion del siguiente
 * delimitador, esto puede traducirse a obtener una lista de archivos y carpetas contenidas justo debajo de una carpeta
 * @param {String} prefix
 */
FileStorage.prototype.listObjectsDirectlyUnder = function(prefix) {};

/**
 * @method getObject
 * Metodo para obtener un objeto con determinada clave, similiar a descargarlo
 * @param {String} key
 */
FileStorage.prototype.getObject = function(key) {};

/**
 * @method putObject
 * Metodo para colocar un objeto a una clave determinada, similar a subirlo, los parametros dependen del servicio
 * utilizado, pero se espera que dicho objeto cuente con un cuerpo (bytes o stream), mimetype (tipo de archivo) y
 * tamaño del cuerpo (en caso de ser stream).
 * @param {String} key
 * @param {Object} parameters
 */
FileStorage.prototype.putObject = function(key, parameters) {};

/**
 * @method copyObject
 * Metodo para copiar un objeto ubicado en una key (from) hacia otra ubicacion (to)
 * @param {String} from
 * @param {String} to
 */
FileStorage.prototype.copyObject = function(from, to) {};

/**
 * @method moveObject
 * Metodo para mover un objeto de una ubicacion (from) hacia otra ubicacion (to)
 * @param {String} from
 * @param {String} to
 */
FileStorage.prototype.moveObject = function(from, to) {};

/**
 * @method deleteObject
 * Metodo para eliminar a un objeto en una key
 * @param {String} key
 */
FileStorage.prototype.deleteObject = function(key) {};

/**
 * @method renameObject
 * Metodo para cambiar el nombre de un objeto (sin moverlo de su ubicacion en el sistema de archivos), por otro nuevo
 * (Cabe resaltar que solo se alterara el nombre del objeto, no su carpeta ni extension)
 * @param {String} key
 * @param {String} newName
 */
FileStorage.prototype.renameObject = function(key, newName) {};

/**
 * @method getPublicURL
 * Metodo para obtener una direccion URL pública que sirva para acceder al objeto especificado por key
 * @param {String} key
 * @returns {Promise<String>}
 */
FileStorage.prototype.getPublicURL = function(key) {};

module.exports = FileStorage;