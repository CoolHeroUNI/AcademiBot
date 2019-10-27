const Curso = require('../Classes/Curso');
const Usuario = require('../Classes/Usuario');
const MaterialEstudio = require('../Classes/MaterialEstudio');

class DataBase {
    constructor() {
        const methods = [
            "connect",
            "getUserById",
            "getAllUsers",
            "getUsersEllegibleForPublicity",
            "updateUser",
            "createUser",
            "getCourseById",
            "getCoursesByUser",
            "getCoursesByTextAndUser",
            "getProbableCoursesByUser",
            "getFileByKey",
            "getFilesByUser",
            "createFile",
            "updateFile",
            "deleteFileByKey",
            "logUserError",
            "logTransaction",
            "logInternalError",
            "getEspecialidadById",
            "getCiclos",
            "getFacultades",
            "getEspecialidadesByFacultad",
            "ping"
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}

/**
 * @returns {Promise<Usuario[]>}
 */
DataBase.prototype.getAllUsers = async function () {};
/**
 *
 * @param {String} Facultad
 * @returns {Promise<Object[]>}
 */
DataBase.prototype.getEspecialidadesByFacultad = async function (Facultad) {};
/**
 *
 * @param {Number} reconTime
 * @param {Boolean} autoReconnect
 * @returns {Promise}
 */
DataBase.prototype.connect = async function(reconTime, autoReconnect) {};
/**
 *
 * @param {Number} userId
 * @returns {Promise<Usuario>}
 */
DataBase.prototype.getUserById = async function (userId) {};
/**
 *
 * @param {Usuario} user
 * @returns {Promise<MaterialEstudio[]>}
 */
DataBase.prototype.getFilesByUser = async function (user) {};
/**
 *
 * @returns {Promise<Object[]>}
 */
DataBase.prototype.getFacultades = async function () {};
/**
 *
 * @param {MaterialEstudio} file
 * @param {Usuario} user
 * @returns {Promise}
 */
DataBase.prototype.updateFile = async function (file, user) {};
/**
 *
 * @param {Error} error
 * @param {String} module
 * @returns {Promise}
 */
DataBase.prototype.logInternalError = async function (error, module) {};
/**
 *
 * @param {String} key
 * @returns {Promise}
 */
DataBase.prototype.deleteFileByKey = async function (key) {};
/**
 *
 * @param {Error} error
 * @param {Usuario} user
 * @param {String} module
 * @returns {Promise}
 */
DataBase.prototype.logUserError = async function (error, user, module) {};
/**
 *
 * @param {Usuario} user
 * @returns {Promise}
 */
DataBase.prototype.updateUser = async function (user) {};
/**
 *
 * @param {Number} userId
 * @returns {Promise<Usuario>}
 */
DataBase.prototype.createUser = async function (userId) {};
/**
 *
 * @param {String} courseId
 * @returns {Promise<Curso>}
 */
DataBase.prototype.getCourseById = async function (courseId) {};
/**
 *
 * @param {String} Facultad
 * @returns {Promise<Curso[]>}
 */
DataBase.prototype.getCoursesByFaculty = async function (Facultad) {};
/**
 *
 * @param {Usuario} user
 * @returns {Promise<Curso[]>}
 */
DataBase.prototype.getCoursesByUser = async function (user) {};
/**
 *
 * @param {String} name
 * @param {Usuario} user
 * @returns {Promise<Curso[]>}
 */
DataBase.prototype.getCoursesByTextAndUser = async function (name, user) {};
/**
 *
 * @param {String} especialidad
 * @returns {Promise<Object>}
 */
DataBase.prototype.getEspecialidadById = async function (especialidad) {};
/**
 *
 * @returns {Promise<Object[]>}
 */
DataBase.prototype.getCiclos = async function () {};
/**
 *
 * @returns {Promise}
 */
DataBase.prototype.ping = async function () {};
/**
 *
 * @param user
 * @returns {Promise<Curso[]>}
 */
DataBase.prototype.getProbableCoursesByUser = async function (user) {};
/**
 *
 * @param {String} key
 * @returns {Promise<MaterialEstudio>}
 */
DataBase.prototype.createFile = async function (key) {};
/**
 *
 * @param {String} key
 * @returns {Promise<MaterialEstudio>}
 */
DataBase.prototype.getFileByKey = async function (key) {};
/**
 *
 * @param {Usuario} user
 * @param {String} key
 * @param {Boolean} success
 * @returns {Promise}
 */
DataBase.prototype.logTransaction = async function (user, key, success) {};
/**
 *
 * @returns {Promise<Usuario[]>}
 */
DataBase.prototype.getUsersEllegibleForPublicity = async function () {};

module.exports = DataBase;