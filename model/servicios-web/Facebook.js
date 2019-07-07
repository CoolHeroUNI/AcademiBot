const RequestPromise = require('request-promise');
/**
 * Clase que modela la interaccion entre el ChatBot y la API Graph de Facebook, 
 * contiene las funciones necesarias para poder maneras los mensajes
 * @class Facebook
 * @constructor
 */
class Facebook {
  /**
   * @param {String} FacebookToken token que permite el acceso a la cuenta del Bot
   */
  constructor(FacebookToken) {
    /**
     * Token que permite las transacciones hacia la API Graph.
     * @property {String} token
     */
    this.token = FacebookToken;
  }
}
/**
 * Metodo para hacer una peticion a la API Graph con intencion de modificar un aspecto 
 * fijo de la experiencia con el usuario: Eg. El menu persistente
 * https://developers.facebook.com/docs/messenger-platform/send-messages/persistent-menu
 * @method profileRequest
 * @param {Object} messageData
 * revisar la documentacion de Facebook para ver las peticiones validas 
 */
Facebook.prototype.profileRequest = function (messageData) {
  let params = {
    uri: 'https://graph.facebook.com/v3.3/me/messenger_profile',
    qs : {access_token : this.token},
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
  };
  RequestPromise(params);
};
/**
 * Metodo para enviar un carrusel con opciones a un usuario
 * https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic
 * @method enviaCarrusel
 * @param {String} id
 * @param {{title:String, buttons:{type:String,title:String,payload:String,url:String}[]}[]} lista
 * @returns {Promise}
 */
Facebook.prototype.enviaCarrusel = function (id, lista) {
  let json = {
    recipient: {id: id},
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: lista
        }
      }
    }
  };
  let params = {
    uri: "https://graph.facebook.com/v3.3/me/messages",
    qs : {access_token : this.token},
    method: "POST",
    json
  };
  return RequestPromise(params);
};
/**
 * Metodo para enviar QuickReply a un usuario 
 * https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies
 * @method enviaQuickReply
 * @param {String} id identificador del usuario
 * @param {{content_type:String,title:String,payload:String}[]} parametros lista con las propiedades 
 * de los botones
 * @param {String} text mensaje que se enviara antes que los botones
 * @returns {Promise}
 */
Facebook.prototype.enviaQuickReply =  function (id, parametros, text) {
  let params = {
    uri: "https://graph.facebook.com/v3.3/me/messages",
    qs : {access_token : this.token},
    method: "POST",
    json: {
      recipient: {id: id},
      message: {
        text,
        quick_replies : parametros
      }
    }
  };
  return RequestPromise(params);
};
/**
 * Metodo para enviar un mensaje de texto a un usuario identificado por id
 * https://developers.facebook.com/docs/messenger-platform/send-messages#sending_text
 * @method enviaTexto
 * @param {String} id
 * @param {String} texto
 * @returns {Promise}
 */
Facebook.prototype.enviaTexto = function (id, texto) {
  let params = {
    uri: "https://graph.facebook.com/v3.3/me/messages",
    qs : {access_token : this.token},
    method: "POST",
    json: {
      messaging_type : "RESPONSE",
      recipient : {id: id},
      message : {text: texto},
    }
  };
  return RequestPromise(params);
};
/**
 * Metodo para enviar una accion al usuario
 * @method enviaAccion
 * @param {String} id
 * @param {String} action
 */
Facebook.prototype.enviaAccion = function (id, action) {
  let param = {
    uri: "https://graph.facebook.com/v3.3/me/messages",
    qs : {access_token : this.token},
    method: "POST",
    json: {
      recipient : {id: id},
      sender_action : action
    }
  };
  RequestPromise(param);
};
/**
 * Metodo para enviar la señal de visto dado un usuario identificado por id
 * https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions
 * @method marcaVisto
 * @param {String} id
 */
Facebook.prototype.marcaVisto = function (id) {
  this.enviaAccion(id, "mark_seen");
};
/**
 * Metodo para enviar la señal de typing on
 * @method marcaTypingOn
 * @param {String} id
 */
Facebook.prototype.marcaTypingOn = function (id) {
  this.enviaAccion(id, "typing_on");
};
/**
 * Metodo para enviar la señal de typing off
 * @method marcaTypingOff
 * @param {String} id
 */
Facebook.prototype.marcaTypingOff = function (id) {
  this.enviaAccion(id,"typing_off");
};
/**
 * Metodo para enviar adjuntos especificos a un usuario identificado por su id, devuelve 
 * un id para reutilizar el adjunto.
 * https://developers.facebook.com/docs/messenger-platform/send-messages#sending_attachments
 * @method enviaAdjunto
 * @param {String} id identificador del usuario
 * @param {{url:String,attachment_id:String}} _payload url que contenga unicamente el adjunto
 * @param {String} type ya sea 'image' o 'file'
 * @returns {Promise}
 */
Facebook.prototype.enviaAdjunto = function (id, _payload, type) {
  this.marcaTypingOn(id);
  let payload = {};
  if (_payload.attachment_id) {
    payload = {attachment_id : _payload.attachment_id};
  }
  else {
    payload = {url:_payload.url, is_reusable:true};
  }
  let messageData = { 
    attachment : {
      type,
      payload
    } 
  };
  let params = {
    uri: 'https://graph.facebook.com/v3.3/me/messages',
    qs : {access_token : this.token},
    method: 'POST',
    json: {
      recipient : {id: id},
      message : messageData,
    }
  };
  return RequestPromise(params);
};
/**
 * Metodo para enviar muchos adjuntos, el tipo no esta determinado, sino que se espera como 
 * paramentro
 * @method enviaAdjuntos
 * @param {String} id
 * @param {{payload:{url:String,attachment_id:String}, extension:String, type:String}[]} archivos
 * @param {String} [type] si no se especifica, se usa su propiedad .type
 * @returns {Promise}
 */
Facebook.prototype.enviaAdjuntos = async function (id, archivos, type) {
  const mensaje = "Error al enviar, reintentando...";
  const err = "Intentalo de nuevo";
  let promesas = [];
  for (let archivo of archivos) {
    type = archivo.type ? archivo.type : type;
    let promesa = this.enviaAdjunto(id, archivo.payload, type);
    try {
      await promesa;
    } catch (error) {
      this.enviaTexto(id, mensaje);
      promesa = this.enviaAdjunto(id, archivo.payload, type);
      try {
        await promesa;
      } catch (error) {
        this.enviaTexto(id, err);
        console.log(error);
      }
    }
    promesas.push(promesa);
  }
  return Promise.all(promesas);
};
/**
 * Metodo para enviar imagenes por medio de una url a un usuario identificado por su 
 * id, devuelve un id para reutilizar el archivo
 * @method enviaImagen
 * @param {String} id
 * @param {String} url
 * @returns {Promise}
 */
Facebook.prototype.enviaImagen = function (id, url) {
  return this.enviaAdjunto(id, {url}, 'image');
};
/**
 * Metodo para enviar archivos por medio de una url a un usuario identificado por su id, 
 * devuelve un id para reutilizar el archivo
 * @method enviaArchivo
 * @param {String} id
 * @param {String} url
 * @returns {Promise}
 */
Facebook.prototype.enviaArchivo = function (id, url) {
  return this.enviaAdjunto(id, {url}, 'file');
};
/**
 * Metodo para obtener los nombres completos de un usuario 
 * por medio de su PPID,
 * CABE ACLARAR QUE ESTE METODO DEVUELVE UNA STRING, QUE SE 
 * PUEDE PARSEAR CON JSON.parse()
 * @method getNames
 * @param {String} PPID
 * @returns {Promise<{name:String, id:String}>}
 */
Facebook.prototype.getNames = function (PPID) {
  const params = {
    uri: `https://graph.facebook.com/v3.3/${PPID}?fields=name`,
    qs : {
      access_token : this.token,
    },
    method : 'GET'
  };
  return RequestPromise(params);
};
/**
 * Metodo estatico dedicado a parametrizar una lista para QuickReply
 * @method parametrizaQuickReply
 * @param {String[][]} botones
 * @returns {{content_type,title,payload}[]}
 * https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies
 */
Facebook.parametrizaQuickReply = function (botones) {
  let respuesta = [];
  for (let boton of botones) {
    let param = {
      content_type:boton[0],
      title:boton[1],
      payload:boton[2]
    };
    respuesta.push(param);
  }
  return respuesta;
};
/**
 * Metodo estatico dedicado a parametrizar una lista para un carrusel
 * @method parametrizaCarrusel
 * @param {{title:String, botones:String[]}[]} elementos
 * @returns {{title:String, buttons:{type:String,title:String,payload:String}[]}[]}
 * https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic
 */
Facebook.parametrizaCarrusel = function (elementos) {
  return elementos.map(elemento => {
    return {
      title: elemento.title,
      buttons: [
        {
          type: "postback",
          title: elemento.botones[0],
          payload: elemento.botones[1]
        }
      ]
    }
  });
};

/**
 * @todo crear metodo que envie varias solicitudes a la graph API
 * solo por los parametros que contengan, y varios metodos que 
 * devuelvan unicamente los parametros de su respectiva solicitud
 */

module.exports = Facebook;