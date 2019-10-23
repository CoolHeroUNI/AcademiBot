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
Dialogflow.prototype.processText = async function (sessionId, text) {
    console.log(sessionId, text);
    const sessionPath = this.sessionsClient.sessionPath(this.projectId, sessionId);
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
    const fulfillmentMessage = fulfillmentMessages
        .filter(message => message['payload'] && message['payload']['fields'])[0];
    const payloadProperties = Object.getOwnPropertyNames(fulfillmentMessage)
        .filter(key => fulfillmentMessage[key]['stringValue']);
    for (let key of payloadProperties) payload[key] = fulfillmentMessage[key]['stringValue'];

    const fields = intent.queryResult['parameters']['fields'];
    const parametersProperties = Object.getOwnPropertyNames(fields)
        .filter(key => parametersProperties[key]['stringValue']);
    for (let key of parametersProperties) parameters[key] = fields[key]['stringValue'];

    return {
        text : fulfillmentText,
        payload : payload,
        parameters : parameters
    };
};
module.exports = Dialogflow;