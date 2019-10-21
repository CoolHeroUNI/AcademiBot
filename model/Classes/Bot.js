const FileStorage = require('../Interfaces/FileStorage');
const MessagingChannel = require('../Interfaces/MessagingChannel');
const NLPMotor = require('../Interfaces/NLPMotor');
const Usuario = require('./Usuario');
const DataBase = require('../Interfaces/DataBase');
const Curso = require('./Curso');
const CacheHandler = require('./CacheHandler');

class Bot {
    constructor() {
        /**
         * @property
         * @type {CacheHandler}
         */
        this.CacheHandler = new CacheHandler();
        /**
         * @property FileStorage
         * @type {FileStorage}
         */
        this.FileStorage = null;
        /**
         * @property MessagingChannel
         * @type {MessagingChannel}
         */
        this.MessagingChannel = null;
        /**
         * @property NLPMotor
         * @type {NLPMotor}
         */
        this.NLPMotor = null;
        /**
         * @property DataBase
         * @type {DataBase}
         */
        this.DataBase = null;

        const methods = [
            "startInteraction",
            "setFileStorage",
            "setMessagingChannel",
            "setNLPMotor",
            "setDataBase",
            "recieveText",
            "recieveCommand",
            "recieveURL",
            "sendGlobalMessage",
            "endInteraction"
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}
Bot.prototype.init = async function () {
    this.CacheHandler.timeLimit = 300;
    return this.DataBase.connect();
};
/**
 * @method setFileStorage
 * Determina el Almacenamiento de archivos a usar para distribuir el material de estudio
 * @param {FileStorage} FileStorage
 */
Bot.prototype.setFileStorage = function (FileStorage) {
    this.FileStorage = FileStorage;
};
/**
 * Determina la base de datos que se usara para manejar las solicitudes
 * @param {DataBase} DataBase
 */
Bot.prototype.setDataBase = function (DataBase) {
    this.DataBase = DataBase;
};
/**
 * @method setMessagingChannel
 * Determina el canal de mensajeria para poder comunicarse con los usuarios
 * @param {MessagingChannel} MessagingChannel
 */
Bot.prototype.setMessagingChannel = function (MessagingChannel) {
    this.MessagingChannel = MessagingChannel;
};
/**
 * Determina el motor de procesamiento de lenguaje natural a usar en las conversaciones con los usuarios
 * @method setNLPMotor
 * @param {NLPMotor} NLPMotor
 */
Bot.prototype.setNLPMotor = function (NLPMotor) {
    this.NLPMotor = NLPMotor;
};
/**
 * Inicia la interaccion con un usuario, devolviendo una instancia de la clase usuario, que sera necesaria para el
 * desarrollo de siguientes metodos
 * @param {Number} userId
 * @returns {User}
 */
Bot.prototype.startInteraction = async function (userId) {
    try {
        await this.MessagingChannel.startInteraction(userId)
    } catch (e) {
        this.DataBase.logInternalError(e, 'MessagingChannel')
            .finally(() => throw e);
    }
    try {
        const user = await this.DataBase.getUserById(userId);
        if (user !== undefined) return user;
        await this.DataBase.createUser(userId);
        return await this.DataBase.getUserById(userId);
    } catch (e) {
        this.DataBase.logInternalError(e, 'DataBase')
            .finally(() => throw e);
    }
};

/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.detectCourses = function (user, message) {
    if (!user.isAbleToRequestCourses()) return [];
    const words = message.split(' ').filter(word => word.length >= 5).map(word => word.limpia());
    return this.DataBase.getProbableCoursesByUser(user)
        .then(courses => {
            const nonZeroMatch = courses.filter(course => {
                for (let word of words) {
                    if (course.matchesName(word)) return true;
                }
                return false;
            });
            const exactMatch = nonZeroMatch.filter(course => {
                for (let word of words) {
                    if (!course.matchesName(word)) return false;
                }
                return true;
            });
            if (exactMatch) return exactMatch;
            // TODO revisar problemas de tiempo de respuesta por la complejidad de calcular los puntajes cada vez que se compara
            return nonZeroMatch.sort((course1, course2) => {
                let score1 = 0, score2 = 0;
                for (let word of words) {
                    if (course1.matchesName(word)) score1++;
                    if (course2.matchesName(word)) score2++;
                }
                return score1 - score2;
            });
        })
};

/**
 *
 * @param {Usuario} user
 * @param {Curso[]} courses
 */
Bot.prototype.sendCourses = function (user, courses) {
    const options = courses.map(course => {
        const option = {};
        const data = course.getData();
        option['title'] = data['Nombre'].toUpperCase();
        option['subtitle'] = `Sis. de evaluación: ${data['SistemaEvaluacion']}\nCréditos: ${data['Creditos']}`;
        option['buttons'] = [
            {
                'title' : `MATERIAL ${data['Codigo']}`,
                'payload' : `SetCurso ${data['Codigo']}`
            }
        ]
    });
    const id = user.getFacebookId();
    return this.MessagingChannel.sendOptionsMenu(id, options);
};

/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.detectFolders = function (user, message) {
    if (!user.isAbleToRequestFolders()) return [];
    const Especialidad = user.getEspecialidad();
    const Curso = user.getCurso();
    return this.DataBase.getEspecialidadById(Especialidad)
        .then(rows => {
            const Facultad = rows[0]['Facultad'];
            return Promise.resolve(Facultad);
        })
        .then(Facultad => {
            const prefix = `${Facultad}/${Curso}/`;
            const cachedFolders = this.CacheHandler.get(prefix);
            if (cachedFolders) return cachedFolders;
            return this.FileStorage.listObjectsDirectlyUnder(prefix)
                .then(respuesta => {
                    const Folders = respuesta.map(o => o.replace(prefix, '').replace('/',''));
                    this.CacheHandler.set(prefix, Folders);
                    return Folders;
                });
        })
        .then(Carpetas => {
            return Carpetas.filter(Carpeta => {
                if (Carpeta.indexOf(message) > 0) return true;
                const carpeta = new RegExp(Carpeta.replace(/-/g, '(|-| )'), 'i');
                return carpeta.test(message);
            });
        });
};

/**
 *
 * @param {Usuario} user
 * @param {String[]} folders
 */
Bot.prototype.sendFolders = function (user, folders) {
    const userId = user.getFacebookId();
    const buttons = folders.map(folder => {
        return {
            'title' : folder.replace(/-/g,' '),
            'payload' : `SetFolder ${folder}`
        }
    });
    const text = 'Quisiera que me muestres las carpetas';
    const Curso = user.getCurso();
    return this.NLPMotor.processText(userId, text)
        .then(response => response['text'].replace('***', Curso))
        .then(Text => this.MessagingChannel.sendReplyButtons(userId, Text, buttons));
};

Bot.prototype.processPostback = function (user, postback) {
    this.prepareCommand(user, postback)
};
Bot.prototype.prepareCommand = function (user, postback) {

};
Bot.prototype.processPayloadFromNLP = function (user, Payload) {
    const {text, payload, parameters} = Payload;
    if (payload['comando']) {
        return this.processCommand(user, Payload)
    } else if (payload['peticion']) {

    }
};
/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.recieveMessage = async function (user, message) {
    if (!user.Valido) return Promise.resolve();
    const courses = await this.detectCourses(user, message);
    if (courses) {
        if (courses.length > 1) return this.sendCourses(user, courses);
        else user.setCurso(courses[0]['Codigo'])
    }
    const folders = await this.detectFolders(user, message);
    if (folders) {
        if (folders.length > 1) return this.sendFolders(user, folders);
        else user.setCarpeta(folders[0]);
    }
    // TODO terminar el tercer eslavon de la deteccion de peticiones
    // TODO crear funciones para preparar y ejecutar comandos proveidos por NLP
    // TODO crear funciones para ejecutar comandos proveidos por MessagingChannel
    // TODO enviar adecuadamente el texto con URLs
    // TODO adaptar las peticiones realizadas en front
    // TODO no olvidar que el modelo puede funcionar independientemente, cada modulo se debe instanciar por separado


    const userId = user.getFacebookId();


    try {
        const response = await this.NLPMotor.processText(userId, message);


    } catch (e) {
        this.DataBase.logInternalError()
    }
    requestIntent.catch(e => this.DataBase.logInternalError(e, 'NLPMotor'));
    requestIntent
        .then(response => {
            const {text, payload} = response;
            const payloadKeys = Object.getOwnPropertyNames(payload);
            if (payloadKeys) return this.processPayloadFromNLP(user, response);
            return this.MessagingChannel.sendText(userId, text, false)
                .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'));
        });


    try {
        const response = this.NLPMotor.processText(userId, message);

    } catch (e) {
        this.DataBase.logInternalError(e, 'NLPMotor')
            .catch(er => console.log(er));
    }

};