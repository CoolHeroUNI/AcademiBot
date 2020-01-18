const express = require('express');
const FBController = require('../controllers/facebookController');
const RequestPromise = require('request-promise');
const { S3 } = require('../lib/classes/instances');
const router = express.Router();
const usersFolder = process.env.ACADEMIBOT_USERS_FOLDER;

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
    FBController.empiezaInteraccion(userId)
      .then(user => {
        User = user;
        if (event['postback'] && event['postback']['payload']) {
          const payload = event['postback']['payload'];
          return FBController.recibePayload(user, payload);
        }
        if (event['message']) {
          const message = event['message'];
          if (message['quick_reply'] && message['quick_reply']['payload']) {
            const payload = message['quick_reply']['payload'];
            return FBController.recibePayload(user, payload);
          }
          if (message['text']) {
            const textMessage = event['message']['text'];
            return FBController.recibeMensaje(user, textMessage);
          }
          if (!message['sticker_id'] && message['attachments']) {
            const attachments = message['attachments'].filter(attachment => attachment['payload'] && attachment['payload']['url']);
            const promises = attachments.map( async attachment => {
              const url = attachment['payload']['url'];
              const attributes = { longitud_en_bytes: null, mime: null, hash: null, ruta: null };
              const fileName = url.substr(0, url.indexOf('?')).split('/').pop();
              const key = usersFolder + '/' + user.get('id') + '/submissions/' + fileName;
              attributes.ruta = key;
              const res = await RequestPromise.get(url, { encoding: null, resolveWithFullResponse: true });
              const Body = res['body'];
              const mime = res['headers']['content-type'];
              attributes.longitud_en_bytes = Body.length;
              if (!mime) throw new Error('No content header in ' + url);
              attributes.mime = mime;
              if (!Body) throw new Error('No body in ' + url);
              const { ETag } = await S3.putObject(key, { Body , ContentType : mime });
              attributes.hash = ETag;
              return attributes;
            });
            return Promise.all(promises)
              .then(atributos => FBController.recibeDonacion(atributos, user));
          }
        }
      })
      .catch(e => console.error(e));
  }
});

router.routeName = "/webhook";
module.exports = router;