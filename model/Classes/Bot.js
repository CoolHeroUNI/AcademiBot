const FileStorage = require('../Interfaces/FileStorage');
const MessagingChannel = require('../Interfaces/MessagingChannel');
const NLPMotor = require('../Interfaces/NLPMotor');
const Usuario = require('./Usuario');
const Archivo = require('./Archivo');
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
    if (!user.isAbleToRequestCourses()) return Promise.resolve([]);
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
                'payload' : `SetCurso:${data['Codigo']}`
            }
        ]
    });
    const id = user.getFacebookId();
    return this.MessagingChannel.sendOptionsMenu(id, options)
        .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'))
        .catch(e => console.log(e));
};


/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.detectFolders = function (user, message) {
    if (!user.isAbleToRequestFolders()) return Promise.resolve([]);
    const Especialidad = user.getEspecialidad();
    const Curso = user.getCurso();
    return this.DataBase.getEspecialidadById(Especialidad)
        .then(rows => {
            const Facultad = rows[0]['Facultad'];
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
            'payload' : `SetFolder:${folder}`
        }
    });
    const text = 'Quisiera que me muestres las carpetas';
    const Curso = user.getCurso();
    return this.NLPMotor.processText(userId, text)
        .then(response => response['text'].replace('***', Curso))
        .then(Text => this.MessagingChannel.sendReplyButtons(userId, Text, buttons))
        .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'));
};

/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.detectFiles = function (user, message) {
    if (!user.isAbleToRequestFiles()) return Promise.resolve([]);
    const Especialidad = user.getEspecialidad();
    const Curso = user.getCurso();
    const Carpeta = user.getCarpeta();
    let prefix = '';
    return this.DataBase.getEspecialidadById(Especialidad)
        .then(rows => {
            const Facultad = rows[0]['Facultad'];
            prefix = `${Facultad}/${Curso}/${Carpeta}/`;
            const cachedFiles = this.CacheHandler.get(prefix);
            if (cachedFiles) return cachedFiles;
            return this.FileStorage.listObjectsUnder(prefix);
        })
        .then(respuesta => {
            const Files = respuesta.map(o => o.replace(prefix, '').replace('/',''));
            this.CacheHandler.set(prefix, Files);
            return Files;
        })
        .then(Files => Files.filter(file => file.matchesText(message)));
};
/**
 *
 * @param {Usuario} user
 * @param {Archivo[]} files
 */
Bot.prototype.sendFiles = function (user, files) {
    const userId = user.getFacebookId();
    const sortedFiles = files.sort((file1, file2) => {
        try {
            return file2.getPage() - file1.getPage();
        } catch (e) {
            this.DataBase.logInternalError(e, 'Archivo').catch(e => console.log(e));
            throw e;
        }
    });
    // Se mapea cada archivo a una promesa que contendra todos los parametros necesarios para hacer las requests
    return Promise.all(sortedFiles.map(file => {
        return new Promise((resolve, reject) => {
            const type = file.getType();
            const params = {
                'type': type,
                'attachment_id': null,
                'url': null
            };
            const reuseId = file.getReuseId();
            if (reuseId) {
                params['attachment_id'] = reuseId;
                resolve(params);
            }
            const key = file.getKey();
            this.FileStorage.getPublicURL(key)
                .then(url => {
                    params['url'] = url;
                    resolve(params)
                })
                .catch(e => reject(e))
        })
    })) //Se envian luego de forma secuencial al usuario
        .then(parameters => this.MessagingChannel.sendSecuentialAttachments(userId, parameters))
        .then(responses => {
            for (let i = 0; i < responses.length; i++) {
                const response = responses[i];
                const file = sortedFiles[i];
                const key = file.getKey();
                if (response instanceof Error) {
                    this.DataBase.logUserError(response, user, 'MessagingChannel')
                        .then(() => this.DataBase.logTransaction(user, key, false))
                        .catch(e => console.log(e));
                } else {
                    const attachment_id = parseInt(response['attachment_id']) || null;
                    file.setReuseId(attachment_id);
                    this.DataBase.logTransaction(user, key, true)
                        .then(() => this.DataBase.updateFile(file, user))
                        .catch(e => console.log(e))
                }
            }
            return Promise.resolve();
        })
        .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'))
        .catch(e => console.log(e));
};
/**
 *
 * @param {Usuario} user
 * @param {Archivo[]} files
 */
Bot.prototype.sendFileOptions = function (user, files) {
    const userId = user.getFacebookId();
    const buttons = files
        .map(file => file.getShortName())
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(File => {
            return {
                'title' : File,
                'payload' : `SetFile:${File}`
            }
        });
    const text = 'Quisiera que me muestres los archivos';
    const Carpeta = user.getCarpeta();
    return this.NLPMotor.processText(userId, text)
        .then(response => response['text'].replace('***', Carpeta))
        .then(Text => this.MessagingChannel.sendReplyButtons(userId, Text, buttons))
        .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'));

};
/**
 *
 * @param {Usuario} user
 */
Bot.prototype.regularizeUser = function (user) {
    const userId = user.getFacebookId();
    if (!user.getEspecialidad()) {
        return this.DataBase.getFacultades()
            .then(rows => {
                const buttons = rows.map(row => {
                    return {
                        'title' : row['Id'],
                        'payload' : `SetFacultad:${row['Id']}`
                    }
                });
                const message = 'Selecciona una Facultad';
                return this.MessagingChannel.sendReplyButtons(userId, message, buttons);
            })
            .catch(e => this.DataBase.logUserError(e, user, 'MessagingChannel'));
    } else if (!user.getCiclo()) {
        
    }
};


/**
 *
 * @param {Usuario} user
 * @param {String} command
 * @param {Object} parameters
 * @param {String} [text]
 */
Bot.prototype.executeCommand = function (user, command, parameters, text) {
    const userId = user.getFacebookId();
    switch (command) {
        case 'Cursos':
            if (!user.isAbleToRequestCourses()) return this.regularizeUser(user);
            return this.detectCourses(user, '')
                .catch(e => this.DataBase.logInternalError(e, 'DataBase'))
                .then(courses => this.sendCourses(user, courses))
                .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'));
        case 'SetEspecialidad':
            const Especialidad = parameters['especialidad'];
            return this.DataBase.getEspecialidadById(Especialidad)
                .catch(e => console.log(e))
                .then(rows => {
                    if (!rows) return Promise.reject(new Error('No se encontro ' + Especialidad));
                    user.setEspecialidad(Especialidad);
                    return this.DataBase.getCiclos();
                })
                .catch(e => this.DataBase.logUserError(e, user, 'DataBase'))
                .then(ciclos => {
                    const buttons = ciclos.map(ciclo => {
                        return {
                            'title' : ciclo['Nombre'],
                            'payload' : `SetCiclo:${ciclo['Nombre']}`
                        }
                    });
                    return this.MessagingChannel.sendReplyButtons(userId, text, buttons);
                })
                .catch(e => this.DataBase.logUserError(e, user, 'MessagingChannel'));
        case 'SetCiclo':
            const Ciclo = parameters['ciclo'];
            return this.DataBase.getCiclos()
                .then(rows => {
                    const ciclo = rows.filter(row => row['Nombre'] === Ciclo)[0]['Numero'];
                    if (!ciclo) return Promise.reject(new Error('No se encontro el ciclo ' + Ciclo));
                    user.setCiclo(parseInt(ciclo));
                    return this.detectCourses(user, '');
                })
                .catch(e => this.DataBase.logUserError(e, user, 'DataBase'))
                .then(courses => {
                    return this.sendCourses(user, courses);
                });
        case 'SetCurso':
            const course = parameters['curso'];
            return this.DataBase.getCourseById(course)
                .then(ro)
        default:
            return Promise.reject(new Error('Commando no valido, '+command));
    }
};
Bot.prototype.prepareCommand = function (user, postback) {

};
Bot.prototype.processPayloadFromNLP = function (user, intent) {
    const {text, payload, parameters} = intent;
    if (payload['comando']) {
        // Commands come with parameters that must be procesed
        const command = payload['comando'];
        return this.executeCommand(user, command, parameters, text);
    } else if (payload['peticion']) {
        // Petitions have no parameters
        const petition = payload['peticion'];
        return this.processPetition(user, petition, text);
    }
    const e = new Error("No method provided to process Payload: "+JSON.stringify(payload));
    this.DataBase.logUserError(e, user, 'NLPMotor')
        .catch(e => console.log(e));
};
/**
 *
 * @param {Usuario} user
 * @param {String} message
 */
Bot.prototype.recieveMessage = async function (user, message) {
    if (!user.Valido) return Promise.reject(new Error('Usuario no valido.'));
    try {
        let userRequestedOnlyOneFolder = false;
        let userRequestedOnlyOneCourse = false;
        const courses = await this.detectCourses(user, message);
        if (courses) {
            if (courses.length > 1) return this.sendCourses(user, courses);
            else {
                user.setCurso(courses[0]['Codigo']);
                userRequestedOnlyOneCourse = true;
            }
        }
        const folders = await this.detectFolders(user, message);
        if (folders) {
            if (folders.length > 1) return this.sendFolders(user, folders);
            else {
                user.setCarpeta(folders[0]);
                userRequestedOnlyOneFolder = true;
            }
        }
        const files = await this.detectFiles(user, message);

        if (files) return this.sendFiles(user, files);

        if (userRequestedOnlyOneFolder) {
            const files = await this.detectFiles(user, '');
            return this.sendFileOptions(user, files);
        } else if (userRequestedOnlyOneCourse) {
            const folders = await this.detectFolders(user, '');
            return this.sendFolders(user, folders);
        }
    } catch (e) {
        this.DataBase.logUserError(e, user, 'FileSystem')
            .catch(e => console.log(e));
    }



    // TODO terminar el tercer eslavon de la deteccion de peticiones
    // TODO crear funciones para preparar y ejecutar comandos proveidos por NLP
    // TODO crear funciones para ejecutar comandos proveidos por MessagingChannel
    // TODO enviar adecuadamente el texto con URLs
    // TODO adaptar las peticiones realizadas en front
    // TODO no olvidar que el modelo puede funcionar independientemente, cada modulo se debe instanciar por separado


    const userId = user.getFacebookId();
    return this.NLPMotor.processText(userId, message)
        .then(intent => {
            const {text, payload} = intent;
            const payloadKeys = Object.getOwnPropertyNames(payload);
            if (payloadKeys) return this.processPayloadFromNLP(user, intent);
            return this.MessagingChannel.sendTextWithURLs(userId, text, false)
        })
        .catch(e => {
            this.DataBase.logInternalError(e, 'NLPMotor');
            const emergencyResponse = 'No puedo brindarte una respuesta fluida.';
            return this.MessagingChannel.sendText(userId, emergencyResponse, false);
        })
        .catch(e => this.DataBase.logInternalError(e, 'MessagingChannel'));



};