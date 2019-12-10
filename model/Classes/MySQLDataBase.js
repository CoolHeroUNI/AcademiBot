const CacheHandler = require('./CacheHandler');
const mysql = require('mysql');
const Usuario = require('./Usuario');
const MaterialEstudio = require('./MaterialEstudio');
const Curso = require('./Curso');

class MySQLDataBase {
    constructor(host, user, password, database, port, cacheTime) {
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

        this.cache = new CacheHandler(cacheTime);
        this.conn.on('error' , (error) => {
          console.log("ERROR FOUND!");
          console.error(error);
          if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            setTimeout(() =>
              this.connect(process.env.MYSQL_RECONNECTION_TIME)
                .then((interval) => {
                  console.log('Successful Reconnection to database.');
                  clearInterval(interval);
                }), 1000);
          }
        });
    }
}

/**
 * @param {Number} reconTime time in miliseconds to send a ping to database
 * @returns {Promise<number>}
 */
MySQLDataBase.prototype.connect = function (reconTime) {
    return new Promise((resolve, reject) => {
        this.conn.connect(err => {
            if (err) return reject(err);
            const inter = (setInterval(() => {
                this.ping()
                  .then(() => console.log('Successful ping to Database.'))
                  .catch(e => {throw e});
            }, reconTime));
            resolve(inter);
        })
    });
};

MySQLDataBase.prototype.getUserById = function (userId) {
    const sql = `SELECT * FROM \`${this.User}\` WHERE FacebookId=${userId}`;
    return this.makeFastQuery(sql)
        .then(rows => (rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))[0]);
};

MySQLDataBase.prototype.getAllUsers = function () {
    const sql = `SELECT * FROM \`${this.User}\``;
    return this.promiseQuery(sql)
        .then(rows => rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))
};

MySQLDataBase.prototype.getUsersEllegibleForPublicity = function () {
    const sql = `SELECT * FROM \`${this.User}\` WHERE AceptaPublicidad=TRUE ORDER BY UltimaInteraccion DESC`;
    return this.promiseQuery(sql)
        .then(rows => rows.map(DataPacket => (new Usuario(DataPacket['FacebookId']).cargaDesdeObjeto(DataPacket))))

};
/**
 * @param {Usuario} user
 */
MySQLDataBase.prototype.updateUser = function (user) {
    const id = mysql.escape(user.getFacebookId());
    const sql = `SELECT * FROM \`${this.User}\` WHERE FacebookId=${id}`;

    const userData = user.getData();
    const Especialidad = userData['Especialidad'], Curso = userData['Curso'], Carpeta = userData['Carpeta'];
    const Ciclo = userData['Ciclo'], CantidadPeticiones = userData['CantidadPeticiones'];
    const AceptaPublicidad = userData['AceptaPublicidad'], Valido = userData['Valido'];

    this.cache.set(sql, [userData]);
    const updateSQL =
`UPDATE \`${this.User}\`
SET Especialidad=${Especialidad ?`'${Especialidad}'` : null}, Curso=${Curso?`'${Curso}'` : null}, Ciclo=${Ciclo}, 
Carpeta=${Carpeta ?`'${Carpeta}'` : null}, CantidadPeticiones=${CantidadPeticiones}, AceptaPublicidad=${AceptaPublicidad}, Valido=${Valido}
WHERE FacebookId=${id}`;
    return this.promiseQuery(updateSQL);
};
MySQLDataBase.prototype.createUser = function (userId) {
    const id = mysql.escape(userId);
    const sql = `INSERT INTO \`${this.User}\`(FacebookId) VALUES (${id})`;
    const sqlSelect = `SELECT * FROM \`${this.User}\` WHERE FacebookId=${id}`;
    const user = new Usuario(userId);
    this.cache.set(sqlSelect, [user.getData()]);
    return this.promiseQuery(sql)
        .then(() => user);
};

MySQLDataBase.prototype.getCourseById = function (courseId) {
    const codigo = mysql.escape(courseId);
    const sql = `SELECT * FROM \`${this.Curso}\` WHERE Codigo=${codigo}`;
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
    if (!Especialidad) return Promise.reject(new Error("No es posible realizar la busqueda por ausencia de Especialidad"));
    const Ciclo = user.getCiclo();
    if (!Ciclo) return Promise.reject(new Error("No es posible realizar la busqueda por ausencia de Ciclo"));
    const sql =
`SELECT Curso
FROM \`${this.ECC}\` 
WHERE Especialidad='${Especialidad}' AND Ciclo=${Ciclo}`;
    return this.makeFastQuery(sql)
        .then(rows => {
            return Promise.all(rows.map(row => {
                const Codigo = row['Curso'];
                return this.getCourseById(Codigo);
            }))
        });
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
FROM \`${this.Curso}\` INNER JOIN \`${this.ECC}\` ON \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo
WHERE Especialidad='${Especialidad}' AND Nombre LIKE '%${Text}%' OR Codigo='${Text}'`;
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
FROM \`${this.Curso}\` INNER JOIN \`${this.ECC}\` ON \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo
WHERE Especialidad='${Especialidad}' AND Ciclo>=${Ciclo - 4} AND Ciclo<=${Ciclo + 4}${Ciclo > 5 ? ' OR Ciclo=11' : ''}`;
    return this.makeFastQuery(sql)
        .then(rows => rows.map(DataPacket => {
            const Codigo = DataPacket['Codigo'];
            const Nombre = DataPacket['Nombre'];
            const SistemaEvaluacion = DataPacket['SistemaEvaluacion'];
            const Creditos = DataPacket['Creditos'];
            return new Curso(Codigo, Nombre, SistemaEvaluacion, Creditos);
        }))
};
MySQLDataBase.prototype.getCoursesByFaculty = function (Facultad) {
    return this.getEspecialidadesByFacultad(Facultad)
        .then(Especialidades => {
            Especialidades = Especialidades.map(Especialidad => `Especialidad=${mysql.escape(Especialidad['Id'])}`);
            const condition = Especialidades.join(' OR ');
            const sql =
`SELECT Codigo,Nombre,SistemaEvaluacion,Creditos 
FROM \`${this.Curso}\` INNER JOIN \`${this.ECC}\` ON \`${this.ECC}\`.Curso=\`${this.Curso}\`.Codigo
WHERE ${condition}`;
            return this.makeFastQuery(sql);
        })
};
MySQLDataBase.prototype.getCiclos = function () {
    const sql = `SELECT * FROM \`${this.Ciclo}\``;
    return this.makeFastQuery(sql);
};
MySQLDataBase.prototype.getFileByKey = function (key) {
    const sql = `SELECT * FROM \`${this.Archivo}\` WHERE \`${this.Archivo}\`.Key='${key}'`;
    return this.makeFastQuery(sql)
        .then(rows => {
            const DataPacket = rows[0];
            if (!DataPacket) return this.createFile(key);
            return Promise.resolve(new MaterialEstudio(DataPacket['Key']).cargaDesdeObjeto(DataPacket));
        })
};
MySQLDataBase.prototype.createFile = function (key) {
    const insertSql = `SELECT * FROM \`${this.Archivo}\` WHERE \`${this.Archivo}\`.Key='${key}'`;
    const cached = this.cache.get(insertSql);
    if (cached !== undefined) return Promise.resolve(new MaterialEstudio(cached[0]['Key']).cargaDesdeObjeto(cached[0]));
    const File = new MaterialEstudio(key);
    const {Curso, Facultad, Carpeta, ContadorPeticiones} = File.getData();
    this.cache.set(insertSql, [File.getData()]);
    const sql =
`INSERT INTO \`${this.Archivo}\` (\`${this.Archivo}\`.Key,Curso,Facultad,Carpeta,ContadorPeticiones) VALUES ('${key}','${Curso}','${Facultad}','${Carpeta}',${ContadorPeticiones})`;
    return this.promiseQuery(sql)
        .then(() => Promise.resolve(File))
        .catch((e) => {
            this.logInternalError(e, 'DataBase');
            return Promise.resolve(File);
        })
};

/**
 *
 * @param {Usuario} user
 * @returns {Promise<MaterialEstudio[]>}
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
                .then(rows => rows.map(DataPacket => (new MaterialEstudio(DataPacket['Key']).cargaDesdeObjeto(DataPacket))))
        })
};

/**
 * TODO Revisar el desempeño de este metodo, buscar optimizar aun mas los tiempos de respuesta y comprobrar errores de escritura en paralelo
 * @param {MaterialEstudio} file
 * @param {Usuario} user
 */
MySQLDataBase.prototype.updateFile = function (file, user) {
    if (!user.isAbleToRequestFiles()) return Promise.reject(new Error('Datos de usuario faltantes'));
    const Curso = user.getCurso();
    const Carpeta = user.getCarpeta();
    const Key = file.getKey();
    const sql = `SELECT * FROM \`${this.Archivo}\` WHERE \`${this.Archivo}\`.Key='${Key}'`;
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
WHERE \`${this.Archivo}\`.Key='${Key}'`;
    return this.promiseQuery(sqlUpdate);
};
MySQLDataBase.prototype.deleteFileByKey = function (key) {
    const Key = mysql.escape(key);
    const sql =
`DELETE FROM \`${this.Archivo}\`
WHERE Key=${Key}`;
    return this.promiseQuery(sql);
};
/**
 *
 * @param {Error} error
 * @param {Usuario} user
 * @param {String} module
 */
MySQLDataBase.prototype.logUserError = function (error, user, module) {
    console.log(error);
    module = mysql.escape(module);
    const message = mysql.escape(error.message.substr(0,198));
    const userId = user.getFacebookId();
    const sql = `INSERT INTO \`${this.Error}\` (Usuario,Mensaje,Modulo) VALUES (${userId},${message},${module})`;
    return this.promiseQuery(sql);
};
/**
 *
 * @param {Error} error
 * @param {String} module
 */
MySQLDataBase.prototype.logInternalError = function (error, module) {
    console.log(error);
    module = mysql.escape(module);
    const message = mysql.escape(error.message.substr(0,198));
    const sql = `INSERT INTO \`${this.Error}\` (Mensaje,Modulo) VALUES (${message},${module})`;
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
    Facultad = mysql.escape(Facultad);
    const sqlEspecialidad =
`SELECT * FROM \`${this.Especialidad}\` 
WHERE Facultad=${Facultad}`;
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
MySQLDataBase.prototype.makeFastQuery = function (SQL) {
    const cached = this.cache.get(SQL);
    if (cached) return Promise.resolve(cached);
    return this.promiseQuery(SQL)
        .then(rows => {
            if (rows.length > 0) this.cache.set(SQL, rows);
            return Promise.resolve(rows);
        });
};
MySQLDataBase.prototype.promiseQuery = function (SQL) {
    return new Promise((resolve, reject) => {
        this.conn.query(SQL,(err, result, fields) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};
MySQLDataBase.prototype.ping = function () {
    return new Promise((resolve, reject) => {
        this.conn.ping(err => {
            if (err) return reject(err);
            return resolve();
        });
    });
};
module.exports = MySQLDataBase;