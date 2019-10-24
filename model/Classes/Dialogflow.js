const NLPMotor = require('../Interfaces/NLPMotor');
const dialogflow = require('dialogflow');

class Dialogflow extends NLPMotor {
    constructor(projectId, language) {
        super();
        this.projectId = projectId;
        this.sessionsClient = new dialogflow.SessionsClient();
        this.language = language;
    }
}

/**
 *
 * @param {Number} sessionId
 * @param {String} text
 * @returns {Promise<{payload: *, text: *, parameters: *}>}
 */
Dialogflow.prototype.processText = async function (sessionId, text) {
    const session = sessionId.toString();
    const sessionPath = this.sessionsClient.sessionPath(this.projectId, session);
    const params = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: this.language
            }
        }
    };
    const intent = (await this.sessionsClient.detectIntent(params))[0];
    const fulfillmentMessages = intent.queryResult.fulfillmentMessages;
    const fulfillmentText = intent.queryResult.fulfillmentText;
    const payload = {};
    const parameters = {};
    console.log(fulfillmentMessages);
    const fulfillmentMessage = fulfillmentMessages
        .filter(message => message['payload'] && message['payload']['fields'])
        .map(message => message['payload']['fields'])[0];
    console.log(fulfillmentMessage);
    if (fulfillmentMessage) {
        const payloadProperties = Object.getOwnPropertyNames(fulfillmentMessage)
            .filter(key => fulfillmentMessage[key]['stringValue']);
        console.log(payloadProperties);
        for (let key of payloadProperties) payload[key] = fulfillmentMessage[key]['stringValue'];
    }

    const fields = intent.queryResult['parameters']['fields'];
    console.log(fields);
    if (fields) {
        const parametersProperties = Object.getOwnPropertyNames(fields)
            .filter(key => fields[key]['stringValue']);
        for (let key of parametersProperties) parameters[key] = fields[key]['stringValue'];
    }


    return {
        text : fulfillmentText,
        payload : payload,
        parameters : parameters
    };
};
module.exports = Dialogflow;