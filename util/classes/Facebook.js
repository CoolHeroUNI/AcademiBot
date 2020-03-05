const RequestPromise = require('request-promise');
const execute = require('async-executer');
const linkify = require('linkifyjs');
class Facebook{
    /**
     * @param {String} Token
     * @param {String} versionAPI
     */
    constructor (Token, versionAPI) {
        /**
         * Atributo que representa las credenciales necesarias para poder utilizar los servicios de Facebook
         * @property Token
         * @type {String}
         */
        this.Token = Token;
        /**
         * Atributo que indica la version de la API de facebook a utilizar
         * @property versionApi
         * @type {String}
         */
        this.versionAPI = versionAPI;
    }
}
Facebook.prototype.startInteraction = function (userId) {
    return this.markSeen(userId)
        .then(() => this.typingOn(userId));
};
Facebook.prototype.sendText = function (userId, text, publicity = false) {
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/messages`,
        qs : {access_token : this.Token},
        method : "POST",
        json : {
            messaging_type : "RESPONSE",
            recipient : {id : userId},
            message : {text: text},
        }
    };
    if (publicity) {
        params['json']['messaging_type'] = "MESSAGE_TAG";
        params['json']['tag'] = "NON_PROMOTIONAL_SUBSCRIPTION"
    }
    return RequestPromise(params);
};
Facebook.prototype.sendURL = function (userId, URL, publicity) {
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/messages`,
        qs : {access_token : this.Token},
        method : "POST",
        json : {
            messaging_type : "RESPONSE",
            recipient : {id : userId},
            message : {
                attachment : {
                    type : "template",
                    payload : {
                        template_type : "open_graph",
                        elements : [{url : URL}]
                    }
                }
            },
        }
    };
    if (publicity) {
        params['json']['messaging_type'] = "MESSAGE_TAG";
        params['json']['tag'] = "NON_PROMOTIONAL_SUBSCRIPTION"
    }
    return RequestPromise(params);
};
Facebook.prototype.sendTextWithURLs = function (userId, text, publicity) {
    const urls = linkify.find(text).filter(link => link['type'] === "url").map(link => {
        const url = link['value'];
        while (text.indexOf(url) >= 0) text = text.replace(url, '');
        return url;
    });
    if (text) {
        return this.sendText(userId, text, publicity)
            .then(() => Promise.all(urls.map(url => this.sendURL(userId, url, publicity))))
    } else {
        return Promise.all(urls.map(url => this.sendURL(userId, url, publicity)));
    }
};
Facebook.prototype.sendAttachment = function (userId, parameters) {
    if (!parameters.hasOwnProperty('url')) return Promise.reject(new Error("Propiedad url faltante"));
    if (!parameters.hasOwnProperty('attachment_id')) return Promise.reject(new Error("Propiedad attachment_id faltante"));
    if (!parameters.hasOwnProperty('type')) return Promise.reject(new Error("Propiedad type faltante"));
    console.log(`User id=${userId}, tipo=${typeof userId}.`);
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/messages`,
        qs : {access_token : this.Token},
        method : "POST",
        json : {
            messaging_type : "RESPONSE",
            recipient : {id : userId},
            message : {
                attachment : {
                    type : parameters['type'],
                    payload : {}
                }
            }
        }
    };
    if (parameters['attachment_id']) {
        params['json']['message']['attachment']['payload']['attachment_id'] = parameters['attachment_id'];
    } else {
        params['json']['message']['attachment']['payload']['url'] = parameters['url'];
        params['json']['message']['attachment']['payload']['is_reusable'] = true;
    }
    console.table(params.json);
    return RequestPromise(params);
};
Facebook.prototype.sendSecuentialAttachments = async function (userId, parameterList) {
    const results = [];
    const send = (userId, parameter) => {
        return this.sendAttachment(userId, parameter)
          .then(result => results.push(result))
          .catch(e => results.push(e))
          .then(() => this.typingOn(userId));
    };
    const params = parameterList.map((parameter) => [userId, parameter]);
    return execute(send, params, 200)
      .then(() => results);
    /*const results = [];
    for (let parameter of parameterList) {
        try {
            const result = await this.sendAttachment(userId, parameter);
            await this.typingOn(userId);
            results.push(result);
        } catch (e) {
            results.push(e);
        }
    }
    return Promise.resolve(results);*/
};


Facebook.prototype.getUserInfo = function (userId) {
    const params = {
        uri: `https://graph.facebook.com/v${this.versionAPI}/${userId}?fields=name`,
        qs : {
            access_token : this.Token,
        },
        method : 'GET'
    };
    return RequestPromise(params)
        .then(result => Promise.resolve(JSON.parse(result)));
};

Facebook.prototype.sendReplyButtons = function (userId, text, parameters) {
    const LIMITE_FACEBOOK = 10;
    while (parameters.length > LIMITE_FACEBOOK) parameters.pop();
    const buttons = parameters.map(parameter => {
        if (!parameter.hasOwnProperty('title') || !parameter.hasOwnProperty('payload'))
            throw new Error("Formato de botones de respuesta invalido.");
        return {
            content_type : 'text',
            title : parameter['title'],
            payload : parameter['payload']
        }
    });
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/messages`,
        qs : {access_token : this.Token},
        method : "POST",
        json : {
            messaging_type : "RESPONSE",
            recipient : {id : userId},
            message : {
                text: text,
                quick_replies : buttons
            },
        }
    };
    return RequestPromise(params);
};
Facebook.prototype.sendOptionsMenu = function (userId, parameters) {
    const LIMITE_FACEBOOK = 10;
    while (parameters.length > LIMITE_FACEBOOK) parameters.pop();
    const opciones = parameters.map(parameter => {
        if (!parameter.hasOwnProperty('title') || !parameter.hasOwnProperty('buttons'))
            throw new Error("Formato de las opciones invalido.");
        if (parameter['buttons'].length > 3 || parameter['buttons'].length === 0)
            throw new Error("Cantidad de botones invalida.");
        // Creacion del arreglo de botones que pertenecen a cada opcion
        const buttons = parameter['buttons'].map(button => {
            if (!button['title'] || !button['payload']) throw new Error("Formato de boton de opciones invalido.");
            return {
                type : 'postback',
                title : button['title'],
                payload : button['payload']
            }
        });
        const param =  {
            title : parameter['title'],
            buttons : buttons
        };
        // Añadir subtitulo a cada opcion en caso se provea uno
        if (parameter['subtitle']) param['subtitle'] = parameter['subtitle'];
        return param;
    });
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/messages`,
        qs : {access_token : this.Token},
        method : 'POST',
        json : {
            messaging_type : 'RESPONSE',
            recipient : {id : userId},
            message : {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type : 'generic',
                        elements : opciones
                    }
                }
            }
        }
    };
    return RequestPromise(params);
};

Facebook.prototype.getAttachmentId = function (parameters) {
    if (!parameters.hasOwnProperty('url')) return Promise.reject(new Error("Propiedad url faltante"));
    if (!parameters.hasOwnProperty('type')) return Promise.reject(new Error("Propiedad type faltante"));
    const params = {
        uri : `https://graph.facebook.com/v${this.versionAPI}/me/message_attachments`,
        qs : {access_token : this.Token},
        method : "POST",
        json: {
            message: {
                attachment: {
                    type: parameters.type,
                    payload: {
                        is_reusable: true,
                        url: parameters.url
                    }
                }
            }
        }
    };
    return RequestPromise(params)
        .then(r => r['attachment_id']);
};

/**
 * Metodo para enviar una accion al usuario
 * @method sendAction
 * @param {String} id
 * @param {String} action
 */
Facebook.prototype.sendAction = function (id, action) {
    let param = {
        uri: "https://graph.facebook.com/v"+this.versionAPI+"/me/messages",
        qs : {access_token : this.Token},
        method: "POST",
        json: {
            recipient : {id},
            sender_action : action
        }
    };
    return RequestPromise(param);
};
/**
 * Metodo para enviar la señal de visto dado un usuario identificado por id
 * https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions
 * @method markSeen
 * @param {String} id
 */
Facebook.prototype.markSeen = function (id) {
    return this.sendAction(id, "mark_seen");
};
/**
 * Metodo para enviar la señal de typing on
 * @method typingOn
 * @param {String} id
 */
Facebook.prototype.typingOn = function (id) {
    return this.sendAction(id, "typing_on");
};
/**
 * Metodo para enviar la señal de typing off al usuario identificado por id
 * @method typingOff
 * @param {String} id
 */
Facebook.prototype.typingOff = function (id) {
    return this.sendAction(id,"typing_off");
};

module.exports = Facebook;