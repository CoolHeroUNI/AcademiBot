class Error_AcademiBot {
    /**
     *
     * @param {Error} E
     * @param {String} Modulo
     */
    constructor (E, Modulo) {
        /**
         * Atributo que indica el usuario que origino el error
         * @property Usuario
         * @type {Number}
         */
        this.Usuario = null;
        /**
         * Atributo que indica el mensaje del error
         * @property Mensaje
         * @type {string}
         */
        this.Mensaje = E.message.substr(0, 200);
        /**
         * Atributo que indica el modulo en el que se origino el error
         * @property Modulo
         * @type {String}
         */
        this.Modulo = Modulo;
        /**
         * Atributo que indica el momento en que ocurrio el error
         * @property FechaError
         * @type {Date}
         */
        this.FechaError = new Date(Date.now());
    }
}

/**
 * Metodo para asignar un usuario causante de error
 * @method setUsuario
 * @param {Number} Usuario
 */
Error_AcademiBot.prototype.setUsuario = function (Usuario) {
    this.Usuario = Usuario;
};

Error_AcademiBot.prototype.getData = function () {
    return {
        Usuario : this.Usuario,
        Mensaje : this.Mensaje,
        Modulo : this.Modulo,
        FechaError : this.FechaError
    }
};
module.exports = Error_AcademiBot;
