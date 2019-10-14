/**
 * @class MessagingChannel
 * Interfaz para el desarrollo de los canales de mensajeria para un ChatBot, debe contar con metodos para comenzar la
 * interaccion con un usuario, enviar mensajes, URLs, texto mixto con URLs, adjuntos y adjuntos de forma secuencial,
 * obtener la informacion de un usuario, enviar botones de respuesta rapida y un menu de opciones
 */
class MessagingChannel {
    constructor() {
        const methods = [
            "startInteraction",
            "sendText",
            "sendURL",
            "sendTextWithURLs",
            "sendAttachment",
            "sendSecuentialAttachments",
            "getUserInfo",
            "sendReplyButtons",
            "sendOptionsMenu",
            "endInteraction"
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}

/**
 * @method startInteraction
 * Inicia la interaccion con un usuario y determina si esta fue exitosa o no
 * @param {Number} userId
 * @returns {Promise<Boolean>}
 */
MessagingChannel.prototype.startInteraction = function(userId) {};

/**
 * @method sendText
 * Envia un mensaje de texto a un usuario
 * @param {Number} userId
 * @param {String} text
 * @returns {Promise}
 */
MessagingChannel.prototype.sendText = function(userId, text) {};

/**
 * @method sendURL
 * Envia una URL a un usuario, dependiendo de las caracteristicas del canal de mensajeria puede generarse una vista
 * previa
 * @param {Number} userId
 * @param {String} URL
 * @returns {Promise}
 */
MessagingChannel.prototype.sendURL = function(userId, URL) {};

/**
 * @method sendTextWithURLs
 * Envia un texto que puede contener URLs, que seran enviadas de forma secuencial luego de enviar el texto
 * @param {Number} userId
 * @param {String} text
 * @returns {Promise}
 */
MessagingChannel.prototype.sendTextWithURLs = function(userId, text) {};

/**
 * @method sendAttachment
 * Envia un archivo adjunto a un usuario, los parametros del envio dependen del canal de mensajeria, devuelve una cadena
 * detallando el resultado de la operacion
 * @param {Number} userId
 * @param {Object} parameters
 * @returns {Promise<String>}
 */
MessagingChannel.prototype.sendAttachment = function(userId, parameters) {};

/**
 * @method sendSecuentialAttachments
 * Envia varios archivos adjuntos a un usuario de forma secuencial, devuelde una lista ordenada detallando el resultado
 * de cada operacion
 * @param {Number} userId
 * @param {Object[]} parameterList
 * @returns {Promise<String[]>}
 */
MessagingChannel.prototype.sendSecuentialAttachments = function(userId, parameterList) {};

/**
 * @method getUserInfo
 * Devuelve la informacion del usuario almacenada en dicho canal de mensajeria
 * @param {Number} userId
 * @returns {Promise<Object>}
 */
MessagingChannel.prototype.getUserInfo = function(userId) {};

/**
 * @method sendReplyButtons
 * Envia botones de un solo uso con respuestras predefinidas, los parametros dependen del canal de mensajeria
 * @param userId
 * @param {Object[]} parameters
 */
MessagingChannel.prototype.sendReplyButtons = function(userId, parameters) {};
/**
 * @method sendOptionsMenu
 * Envia menu persistente con opciones predefinidas, los parametros dependen del canal de mensajeria
 * @param {Number} userId
 * @param {Object[]} parameters
 */
MessagingChannel.prototype.sendOptionsMenu = function(userId, parameters) {};
/**
 * @method endInteraction
 * Culmina la interaccion con el usuario
 * @param {Number} userId
 * @returns {Promise}
 */
MessagingChannel.prototype.endInteraction = function(userId) {};
module.exports = MessagingChannel;