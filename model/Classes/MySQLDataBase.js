const DataBase = require('../Interfaces/DataBase');
const CacheHandler = require('./CacheHandler');
const mysql = require('mysql');
const Usuario = require('./Usuario');
const Archivo = require('./Archivo');
const Curso = require('./Curso');

class MySQLDataBase extends DataBase {
    constructor(host, user, password, database, port) {
        super();
        this.db = database;
        this.conn = mysql.createConnection({
            host : host,
            user : user,
            password : password,
            database : database,
            port : port
        });
        this.Archivo = 'Archivo';
        this.Ciclo = 'Ciclo';
        this.Curso = 'Curso';
        this.Error = 'Error';
        this.Especialidad = 'Especialidad';
        this.ECC = 'Especialidad_Curso_Ciclo';
        this.Facultad = 'Facultad';
        this.Transaccion = 'Transaccion';
        this.User = 'Usuario_AcademiBot';

        this.cache = new CacheHandler();
    }
}
MySQLDataBase.prototype.connect = function () {
    return new Promise((resolve, reject) => {
        this.conn.connect(err => {
            if (err) return reject(err);
            return resolve();
        })
    });
};

MySQLDataBase.prototype.getUserById = function (userId) {
    const sql = `SELECT * FROM \`${this.User}\` WHERE FacebookId=${userId}`;
    return this.makeFastQuery(sql)
        .then(rows => (rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))[0])
};

MySQLDataBase.prototype.getAllUsers = function () {
    const sql = `SELECT * FROM \`${this.User}\``;
    return this.promiseQuery(sql)
        .then(rows => rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))
};

MySQLDataBase.prototype.getUsersEllegibleForPublicity = function () {
    const sql = `SELECT * FROM \`${this.User}\` WHERE AceptaPublicidad=TRUE`;
    return this.promiseQuery(sql)
        .then(rows => rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))

};
/**
 * @param {Usuario} user
 */
MySQLDataBase.prototype.updateUser = function (user) {
    const id = mysql.escape(user.getFacebookId());
    const sql = `SELECT * FROM \`${this.User}\` WHERE FacebookId=${id}`;

    const userData = user.getUpdateData();
    const Especialidad = userData['Especialidad'], Curso = userData['Curso'], Carpeta = userData['Carpeta'];
    const Ciclo = userData['Ciclo'], CantidadPeticiones = userData['CantidadPeticiones'];
    const AceptaPublicidad = userData['AceptaPublicidad'], Valido = userData['Valido'];

    this.cache.set(sql, [userData]);
    const updateSQL =
`UPDATE \`${this.User}\`
SET Especialidad='${Especialidad}', Curso='${Curso}', Ciclo=${Ciclo}, Carpeta='${Carpeta}', 
CantidadPeticiones=${CantidadPeticiones}, AceptaPublicidad=${AceptaPublicidad}, Valido=${Valido}
WHERE FacebookId=${id}`;
    return this.promiseQuery(updateSQL);
};
MySQLDataBase.prototype.createUser = function (userId) {
    const id = mysql.escape(userId);
    const sql = `INSERT INTO \`${this.User}\` (FacebookId) VALUES (${id})`;
    return this.promiseQuery(sql)
        .then(() => new Usuario(userId));
};

MySQLDataBase.prototype.getCourseById = function (courseId) {
    const codigo = mysql.escape(courseId);
    const sql = `SELECT * FROM \`${this.Curso}\` WHERE Codigo='${codigo}'`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => {
            const Codigo = DataPacket['Codigo'];
            const Nombre = DataPacket['Nombre'];
            const SistemaEvaluacion = DataPacket['SistemaEvaluacion'];
            const Creditos = DataPacket['Creditos'];
            return new Curso(Codigo, Nombre, SistemaEvaluacion, Creditos);
        })[0])
};
/**
 * @param {Usuario} user
 */
MySQLDataBase.prototype.getCoursesByUser = function (user) {
    const Especialidad = user.getEspecialidad();
    if (!Especialidad) throw new Error("No es posible realizar la busqueda por ausencia de Especialidad");
    const Ciclo = user.getCiclo();
    if (!Ciclo) throw new Error("No es posible realizar la busqueda por ausencia de Ciclo");
    const sql =
`SELECT Codigo,Nombre,SistemaEvaluacion,Creditos 
FROM \`${this.Curso}\`,\`${this.ECC}\` 
WHERE \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo AND Especialidad='${Especialidad}' AND Ciclo=${Ciclo}`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => {
            const Codigo = DataPacket['Codigo'];
            const Nombre = DataPacket['Nombre'];
            const SistemaEvaluacion = DataPacket['SistemaEvaluacion'];
            const Creditos = DataPacket['Creditos'];
            return new Curso(Codigo, Nombre, SistemaEvaluacion, Creditos);
        }))
};
/**
 * DEPRECATED
 * @param {String} text
 * @param {Usuario} user
 */
MySQLDataBase.prototype.getCoursesByTextAndUser = function (text, user) {
    const Text = mysql.escape(text);
    if (Text.length < 5) return Promise.resolve([]);
    const Especialidad = user.getEspecialidad();
    if (!Especialidad) throw new Error("No es posible realizar la busqueda por ausencia de Especialidad");
    const sql =
`SELECT Codigo,Nombre,SistemaEvaluacion,Creditos 
FROM \`${this.Curso}\`,\`${this.ECC}\` 
WHERE \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo AND Especialidad='${Especialidad}' AND 
(Nombre LIKE '%${Text}%' OR Codigo='${Text}')`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => {
            const Codigo = DataPacket['Codigo'];
            const Nombre = DataPacket['Nombre'];
            const SistemaEvaluacion = DataPacket['SistemaEvaluacion'];
            const Creditos = DataPacket['Creditos'];
            return new Curso(Codigo, Nombre, SistemaEvaluacion, Creditos);
        }))
};
MySQLDataBase.prototype.getProbableCoursesByUser = function (user) {
    const Especialidad = user.getEspecialidad();
    if (!Especialidad) throw new Error("No es posible realizar la busqueda por ausencia de Especialidad");
    const Ciclo = user.getCiclo();
    if (!Ciclo) throw new Error("No es posible realizar la busqueda por ausencia de Ciclo");
    // La query a realizarse toma los cursos de hasta 2 ciclos por debajo y 1 por encima, ademas si se encuentra en el
    // quinto ciclo se toman los electivos
    const sql =
`SELECT Codigo,Nombre,SistemaEvaluacion,Creditos 
FROM \`${this.Curso}\`,\`${this.ECC}\` 
WHERE \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo AND Especialidad='${Especialidad}' AND 
Ciclo>=${Ciclo - 2} AND Ciclo<${Ciclo + 2}${Ciclo > 5 ? ' OR Ciclo=11' : ''}`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => {
            const Codigo = DataPacket['Codigo'];
            const Nombre = DataPacket['Nombre'];
            const SistemaEvaluacion = DataPacket['SistemaEvaluacion'];
            const Creditos = DataPacket['Creditos'];
            return new Curso(Codigo, Nombre, SistemaEvaluacion, Creditos);
        }))
};
MySQLDataBase.prototype.getCiclos = function () {
    const sql = `SELECT * FROM \`${this.Ciclo}\``;
    return this.makeFastQuery(sql);
};
MySQLDataBase.prototype.getFileByKey = function (key) {
    const Key = mysql.escape(key);
    const sql =
`SELECT * FROM \`${this.Archivo}\`
WHERE Key='${Key}'`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => (new Archivo(DataPacket['Key']).cargaDesdeObjeto(DataPacket)))[0])
};
MySQLDataBase.prototype.createFile = function (key) {
    const File = new Archivo(key);
    const {Key, Curso, Facultad, Carpeta, ContadorPeticiones} = File.getData();
    const sql =
`INSERT INTO \`${this.Archivo}\` (Key,Curso,Facultad,Carpeta,ContadorPeticiones)
VALUES ('${Key}','${Curso}','${Facultad}','${Carpeta}',${ContadorPeticiones}`;
    return this.promiseQuery(sql)
        .then(() => File);
};

/**
 *
 * @param {Usuario} user
 * @returns {Promise<Archivo[]>}
 */
MySQLDataBase.prototype.getFilesByUser = function (user) {
    const Especialidad = user.getEspecialidad();
    if (!Especialidad) throw new Error("No es posible realizar la busqueda por ausencia de Especialidad");
    const Curso = user.getCurso();
    if (!Curso) throw new Error("No es posible realizar la busqueda por ausencia de Curso");
    const Carpeta = user.getCarpeta();
    if (!Carpeta) throw new Error("No es posible realizar la busqueda por ausencia de Carpeta");
    return this.getEspecialidadById(Especialidad)
        .then(rows => {
            const Facultad = rows[0]['Facultad'];
            if (!Facultad) throw new Error("No es posible realizar la busqueda por ausencia de Facultad");
            const sqlFiles =
`SELECT * FROM \`${this.Archivo}\` 
WHERE Facultad='${Facultad}' AND Curso='${Curso}' AND Carpeta='${Carpeta}'`;
            return this.makeFastQuery(sqlFiles)
                .then(rows => rows.map(DataPacket => (new Archivo(DataPacket['Key']).cargaDesdeObjeto(DataPacket))))
        })
};

/**
 * TODO Revisar el desempeño de este metodo, buscar optimizar aun mas los tiempos de respuesta y comprobrar errores de escritura en paralelo
 * @param {Archivo} file
 * @param {Usuario} user
 */
MySQLDataBase.prototype.updateFile = function (file, user) {
    if (!user.isAbleToRequestFiles()) return Promise.reject(new Error('Datos de usuario faltantes'));
    const Curso = user.getCurso();
    const Carpeta = user.getCarpeta();
    const Key = file.getKey();
    const sql =
`SELECT * FROM \`${this.Archivo}\`
WHERE Key='${Key}'`;
    this.cache.set(sql, [file.getData()]);
    const updateData = file.getUpdateData();
    const ReuseId = updateData['ReuseId'], ContadorPeticiones = updateData['ContadorPeticiones'];
    this.getFilesByUser(user)
        .then(files => {
            // Busqueda del archivo con la misma Key para reemplazar sus datos en cache
            const fileData = files.map(File => File.equals(file) ? file.getData() : File.getData());
            this.getEspecialidadById(user.getEspecialidad())
                .then(rows => {
                    const Facultad = rows[0]['Facultad'];
                    const sqlFiles =
`SELECT * FROM \`${this.Archivo}\` 
WHERE Facultad='${Facultad}' AND Curso='${Curso}' AND Carpeta='${Carpeta}'`;
                    this.cache.set(sqlFiles, fileData);
                });
        });
    const sqlUpdate =
`UPDATE \`${this.Archivo}\`
SET ReuseId=${ReuseId}, ContadorPeticiones=${ContadorPeticiones}
WHERE Key='${Key}'`;
    return this.promiseQuery(sqlUpdate);
};
MySQLDataBase.prototype.deleteFileByKey = function (key) {
    const Key = mysql.escape(key);
    const sql =
`DELETE FROM \`${this.Archivo}\`
WHERE Key='${Key}'`;
    return this.promiseQuery(sql);
};
/**
 *
 * @param {Error} error
 * @param {Usuario} user
 * @param {String} module
 */
MySQLDataBase.prototype.logUserError = function (error, user, module) {
    const message = error.message.substr(0,200);
    const userId = user.getFacebookId();
    const sql = `INSERT INTO \`${this.Error}\` (Usuario,Mensaje,Modulo) VALUES (${userId},"${message}",'${module}')`;
    return this.promiseQuery(sql);
};
/**
 *
 * @param {Error} error
 * @param {String} module
 */
MySQLDataBase.prototype.logInternalError = function (error, module) {
    const message = error.message.substr(0, 200);
    console.log(error);
    const sql = `INSERT INTO \`${this.Error}\` (Mensaje,Modulo) VALUES ("${message}",'${module}')`;
    return this.promiseQuery(sql);
};
/**
 *
 * @param {Usuario} user
 * @param {String} key
 * @param {Boolean} success
 */
MySQLDataBase.prototype.logTransaction = function (user, key, success) {
    const userId = user.getFacebookId();
    const sql = `INSERT INTO \`${this.Transaccion}\` (Usuario,KeyObtenida,Exitosa) VALUES (${userId},'${key}',${success})`;
    return this.promiseQuery(sql);
};


MySQLDataBase.prototype.getEspecialidadesByFacultad = function (Facultad) {
    const sqlEspecialidad =
`SELECT * FROM \`${this.Especialidad}\` 
WHERE Facultad='${Facultad}'`;
    return this.makeFastQuery(sqlEspecialidad);
};
MySQLDataBase.prototype.getFacultades = function () {
    const sql = `SELECT * FROM ${this.Facultad}`;
    return this.makeFastQuery(sql);
};

MySQLDataBase.prototype.getEspecialidadById = function (Especialidad) {
    const sqlFacultad =
`SELECT * FROM \`${this.Especialidad}\` 
WHERE Id='${Especialidad}'`;
    return this.makeFastQuery(sqlFacultad);
};
MySQLDataBase.prototype.makeFastQuery = async function (SQL) {
    const cached = this.cache.get(SQL);
    if (cached) return cached;
    const rows = await this.promiseQuery(SQL);
    this.cache.set(SQL, rows);
    return rows;
};
MySQLDataBase.prototype.promiseQuery = function (SQL) {
    return new Promise((resolve, reject) => {
        this.conn.query(SQL,(err, result, fields) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};
module.exports = MySQLDataBase;