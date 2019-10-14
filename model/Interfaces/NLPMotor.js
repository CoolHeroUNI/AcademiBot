class NLPMotor {
    constructor() {
        const methods = [
            "processText",
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}

/**
 * @method processText
 * Utiliza los servicios del motor de procesamiento de lenguaje natural para obtener una respuesta a un texto para una
 * sesion definida por un identificador
 * @param {Number} sessionId
 * @param {String} text
 * @returns {Promise<{text:String, payload:Object}>}
 */
NLPMotor.prototype.processText = function(sessionId, text) {};
module.exports = NLPMotor;