const Curso = require('../Classes/Curso');


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
DataBase.prototype.getAllUsers = async function () {};
DataBase.prototype.getEspecialidadesByFacultad = async function (Facultad) {};
DataBase.prototype.connect = async function() {};
DataBase.prototype.getUserById = async function (userId) {};
DataBase.prototype.getFilesByUser = async function (user) {};
DataBase.prototype.getFacultades = async function () {};
DataBase.prototype.updateFile = async function (file, user) {};
DataBase.prototype.logInternalError = async function (error, module) {};
DataBase.prototype.deleteFileByKey = async function (key) {};
DataBase.prototype.logUserError = async function (error, user, module) {};
DataBase.prototype.updateUser = async function (user) {};
DataBase.prototype.createUser = async function (userId) {};
DataBase.prototype.getCourseById = async function (courseId) {};
DataBase.prototype.getCoursesByUser = async function (user) {};
DataBase.prototype.getCoursesByTextAndUser = async function (name) {};
DataBase.prototype.getEspecialidadById = async function (especialidad) {};
DataBase.prototype.getCiclos = async function () {};
DataBase.prototype.ping = async function () {};
/**
 *
 * @param user
 * @returns {Promise<Curso[]>}
 */
DataBase.prototype.getProbableCoursesByUser = async function (user) {};
DataBase.prototype.createFile = async function (key) {};
DataBase.prototype.getFileByKey = async function (key) {};
DataBase.prototype.logTransaction = async function (user, key, success) {};
DataBase.prototype.getUsersEllegibleForPublicity = async function () {};

module.exports = DataBase;