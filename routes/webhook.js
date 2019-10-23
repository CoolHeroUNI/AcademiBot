const express = require('express');
const {AcademiBot} = require('../src/Instances');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send("Wrong token");
    }
});

router.post('/', (req, res) => {
    res.sendStatus(200);

    const messagingEvents = req.body.entry[0]['messaging'];
    for (const event of messagingEvents) {
        const userId = event['sender']['id'];
        AcademiBot.startInteraction(userId)
            .then(user => {
                if (event['message'] && event['message']['text']) {
                    const textMessage = event['message']['text'];
                    return AcademiBot.recieveMessage(user, textMessage);
                }
            })
    }
});
process.on('SIGTERM', () => {
    console.log('Ya esta atardeciendo...');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

module.exports = router;