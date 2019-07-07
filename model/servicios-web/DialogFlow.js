const dialogflow = require('dialogflow');
// Codigo de Español latinoamericano
const CODIGO_LENGUAJE = "es";
/**
 * Clase que permitira la obtencion de respuestas inteligentes para conversaciones
 * @class DialogFlow
 * @constructor
 * @param {String} IdProyecto Identificador del proyecto
 * @param {String} clavePrivada Clave privada para acceder a la API
 * @param {String} emailCliente Email del servicio 
 */
class DialogFlow {
  /**
   * @constructor
   * @param {String} idProyecto
   */
  constructor(idProyecto) {

    /* const IdProyecto = configuracion.IdProyecto;
    const clavePrivada = configuracion.clavePrivada;
    const emailCliente = configuracion.emailCliente; */

    /**
     * Identificador del proyecto actual
     * @property {String} idProyecto
     */
    this.idProyecto = idProyecto;
    /**
     * Sesion del cliente
     * @property {SessionsClient} sessionClient
     */
    this.sessionClient = new dialogflow.SessionsClient();
  }
}
/**
 * Metodo para obtener una respuesta de la API de dialogflow
 * @method procesaIntencion
 * @param {String} texto 
 * @param {String} idSesion
 * @returns {Promise<{texto:String,comando:String}>}
 */
DialogFlow.prototype.procesaIntencion = async function (texto, idSesion) {
  const sessionPath = this.sessionClient.sessionPath(this.idProyecto, idSesion);
  const peticion = {
    session: sessionPath,
    queryInput: {
      text: {
        text: texto,
        languageCode: CODIGO_LENGUAJE
      }
    }
  };
  let respuesta = await this.sessionClient.detectIntent(peticion);
  return this.parseIntentResponse(respuesta[0]);
};
/**
 * Metodo para obtener la informacion relevante de una respuesta de
 * DialogFlow
 * @method parseIntentResponse
 * @param {DetectIntentResponse} respuesta
 * @returns {{texto:String,comando:String,peticion:String,params:Object}}
 */
DialogFlow.prototype.parseIntentResponse = function (respuesta) {
  const salida = {
    params : {},
    texto: "",
  };
  const fulfillmentMessages = respuesta.queryResult.fulfillmentMessages;
  if (!fulfillmentMessages) return salida;
  // Texto de respuesta
  // TODO parsear adecuadamente las intenciones de dialogflow
  salida.texto = respuesta.queryResult.fulfillmentText;
  salida.params = respuesta.queryResult.parameters.fields;
  for (let mensaje of fulfillmentMessages) {

    if (mensaje.payload && mensaje.payload.fields) {

      if (mensaje.payload.fields.comando) {
        salida.comando = mensaje.payload.fields.comando.stringValue;
      } else if (mensaje.payload.fields.peticion) {
        salida.peticion = mensaje.payload.fields.peticion.stringValue;
      }
    }
  }
  //if (!payload) return salida;
  //if (payload.fields && payload.fields.comando && payload.fields.comando.stringValue) salida.comando = payload.fields.comando.stringValue;
  return salida;
};

module.exports = DialogFlow;