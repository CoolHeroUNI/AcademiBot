/**
 * Una clase que abarca los atributos de los cursos, identificados por un codigo de curso unico
 * @class Curso
 */
class Curso {
    /**
     *
     * @param {String} Codigo
     * @param {String} Nombre
     * @param {String} SistemaEvaluacion
     * @param {Number} Creditos
     */
    constructor (Codigo, Nombre, SistemaEvaluacion, Creditos) {
        if (!Codigo) throw new Error("Campo Codigo debe ser no nulo para la instanciacion.");
        if (!Nombre) throw new Error("Campo Nombre debe ser no nulo para la instanciacion.");
        if (!SistemaEvaluacion) throw new Error("Campo SistemaEvaluacion debe ser no nulo para la instanciacion.");
        if (!Creditos) throw new Error("Campo Creditos debe ser no nulo para la instanciacion.");
        /**
         * Atributo referido al codigo del curso
         * @property Codigo
         * @type {String}
         */
        this.Codigo = Codigo;
        /**
         * Atributo referido al nombre de un curso
         * @property Nombre
         * @type {String}
         */
        this.Nombre = Nombre;
        /**
         * Atributo referido al sistema de evaluacion de un curso
         * @property SistemaEvaluacion
         * @type {String}
         */
        this.SistemaEvaluacion = SistemaEvaluacion;
        /**
         * Atributo que indica la cantidad de creditos de un curso
         * @property Creditos
         * @type {Number}
         */
        this.Creditos = Creditos;
    }
}

/**
 *
 * @returns {String}
 */
Curso.prototype.getCodigo = function () {
    return this.Codigo;
};
/**
 * Metodo para comprobar si un texto encaja con un curso, util para filtrar
 * @method matchesName
 * @param {String} Text
 * @returns {boolean}
 */
Curso.prototype.matchesName = function (Text) {
    if (Text.length === 0) return true;
    const codigoTester = new RegExp(this.getCodigo(), 'i');
    const nameTester = new RegExp(this.Nombre, 'i');
    const expresion = new RegExp(`${Text}`,'i');
    return expresion.test(this.Nombre) || nameTester.test(Text) || codigoTester.test(Text);
};
/**
 * Metodo para obtener la informacion del curso en forma de objeto para facilitar su asignacion
 * @method getData
 * @returns {{Nombre: String, Codigo: *, SistemaEvaluacion: *, Creditos: *}}
 */
Curso.prototype.getData = function () {
    return {
        Codigo : this.Codigo,
        Nombre : this.Nombre,
        SistemaEvaluacion : this.SistemaEvaluacion,
        Creditos : this.Creditos
    }
};
module.exports = Curso;