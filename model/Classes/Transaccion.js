/**
 * Clase que abarca los atributos de las transacciones de archivos realizadas en AcademiBot
 * @class Transaccion
 */
class Transaccion {
    /**
     * @param {Number} Usuario
     * @param {String} Key
     */
    constructor (Usuario, Key) {
        /**
         * Atributo que indica el usuario que realiza la transaccion
         * @property Usuario
         * @type {Number}
         */
        this.Usuario = Usuario;
        /**
         * Atributo que indica la ruta del archivo sujeto a transaccion
         * @property KeyObtenida
         * @type {String}
         */
        this.KeyObtenida = Key;
        /**
         * Atributo que indica la fecha en que se realizo la transaccion
         * @property FechaEjecucion
         * @type {Date}
         */
        this.FechaEjecucion = new Date(Date.now());
        /**
         * Atributo que indica si la transaccion se realizo con exito
         * @property Exitosa
         * @type {Boolean}
         */
        this.Exitosa = null;
    }
}

/**
 * Metodo para indicar que la transaccion fue exitosa, se devuelve una referencia a la misma transaccion
 * @method fulfill
 * @returns {Transaccion}
 */
Transaccion.prototype.fulfill = function () {
    this.Exitosa = true;
    return this;
};
/**
 * Metodo para indicar que la transaccion no fue exitosa, se devuelve la propia instancia de la transaccion
 * @method reject
 * @returns {Transaccion}
 */
Transaccion.prototype.reject = function () {
    this.Exitosa = false;
    return this;
};
/**
 * Metodo para obtener la informacion de la transaccion en forma de objeto
 * @method getData
 * @returns {{Usuario: Number, FechaEjecucion: Date, KeyObtenida: String, Exitosa: Boolean}}
 */
Transaccion.prototype.getData = function () {
    return {
        Usuario : this.Usuario,
        KeyObtenida : this.KeyObtenida,
        FechaEjecucion : this.FechaEjecucion,
        Exitosa : this.Exitosa
    }
};
module.exports = Transaccion;