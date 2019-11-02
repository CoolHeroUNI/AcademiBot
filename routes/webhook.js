const express = require('express');
const {AcademiBot, S3, MySQL, FB} = require('../src/Instances');
const RequestPromise = require('request-promise');
const router = express.Router();
const submissionsFolder = process.env.ACADEMIBOT_SUBMISSIONS_FOLDER;
const thanksSubmission = process.env.ACADEMIBOT_SUBMISSIONS_MESSAGE;

router.get('/', (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send("Wrong token");
    }
});

router.post('/', (req, res) => {
    res.sendStatus(200);
    const messagingEvents = req.body.entry[0]['messaging'];
    for (const event of messagingEvents) {
        const userId = parseInt(event['sender']['id']);
        let User;
        AcademiBot.startInteraction(userId)
            .then(user => {
                User = user;
                if (event['postback'] && event['postback']['payload']) {
                    const payload = event['postback']['payload'];
                    return AcademiBot.recievePayload(user, payload);
                }
                if (event['message']) {
                    const message = event['message'];
                    if (message['quick_reply'] && message['quick_reply']['payload']) {
                        const payload = message['quick_reply']['payload'];
                        return AcademiBot.recievePayload(user, payload);
                    }
                    if (message['text']) {
                        const textMessage = event['message']['text'];
                        return AcademiBot.recieveMessage(user, textMessage);
                    }
                    if (!message['sticker_id'] && message['attachments']) {
                        const attachments = message['attachments'];
                        return Promise.all(attachments
                            .filter(attachment => attachment['payload'] && attachment['payload']['url'])
                            .map(attachment => {
                                const url = attachment['payload']['url'];
                                const fileName = url.substr(0, url.indexOf('?')).split('/').pop();
                                const key = submissionsFolder + '/' + user.getFacebookId() + '/' + fileName;
                                return RequestPromise.get(url, {encoding: null, resolveWithFullResponse: true})
                                    .then(res => {
                                        if (!res['headers']['content-type']) return Promise.reject(new Error('No content header in ' + url));
                                        if (!res['body']) return Promise.reject(new Error('No body in ' + url));
                                        const body = res['body'];
                                        const mime = res['headers']['content-type'];
                                        return S3.putObject(key, {
                                            Body : body,
                                            ContentType : mime
                                        });
                                    })
                                    .catch(e => {
                                        console.log(e);
                                        MySQL.logUserError(e, user, 'Webhook')
                                    });
                            }))
                            .then(() => FB.sendText(userId, thanksSubmission, false));
                    }
                }
            })
            .then(() => AcademiBot.endInteraction(User))
            .catch(e => console.log(e));
    }
});

module.exports = router;