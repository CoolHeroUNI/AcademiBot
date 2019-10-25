const express = require('express');
const {AcademiBot} = require('../src/Instances');
const router = express.Router();

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
                }
            })
            .then(() => AcademiBot.endInteraction(User))
            .catch(e => console.log(e));
    }
});

module.exports = router;