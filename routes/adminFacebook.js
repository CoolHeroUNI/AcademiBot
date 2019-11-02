const express = require('express');
const router = express.Router();
const {FB, MySQL} = require('../src/Instances');

const longitudSublista = parseInt(process.env.FACEBOOK_GLOBAL_LENGTH);
const timeOut = parseInt(process.env.FACEBOOK_GLOBAL_TIMEOUT) * 1000;

router.get('/', (req, res) => {
  res.render('adminFacebook', {})
});

function Wait (time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}


async function enviaMensajeGlobal(users, text) {
  let i = 0;
  let j = 0;
  while (i < users.length) {
    const user = users[i];
    const userId = user.getFacebookId();
    FB.sendTextWithURLs(userId, text, true)
        .then(() => console.log('Success sending the ' + j + 'th message of ' + users.length))
        .catch(e => MySQL.logUserError(e, user, 'AdminFacebook'))
        .finally(() => j++);
    i++;
    if (i % longitudSublista === 0) {
      console.log('Waiting ' + timeOut +' ms');
      await Wait(timeOut);
    }
  }
}



router.post('/', (req, res) => {
  const action = req.query.action;
  switch (action) {
    case 'global':
      const texto = req.body.texto;
      return MySQL.getUsersEllegibleForPublicity()
          .then(users => {
            enviaMensajeGlobal(users, texto)
                .catch(e => console.log(e));
            res.sendStatus(200);
          });
    default:
      return res.sendStatus(405);
  }
});

module.exports = router;