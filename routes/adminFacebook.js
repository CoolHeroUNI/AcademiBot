const express = require('express');
const router = express.Router();
const {FB, MySQL} = require('../src/Instances');

const longitudSublista = process.env.FACEBOOK_GLOBAL_LENGTH;
const timeOut = process.env.FACEBOOK_GLOBAL_TIMEOUT;

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
  while (i < users.length) {
    const user = users[i];
    const userId = user.getFacebookId();
    FB.sendTextWithURLs(userId, text, true)
        .then(() => console.log(i, users.length))
        .catch(e => MySQL.logUserError(e, user, 'AdminFacebook'));
    i++;
    if (i % longitudSublista === 0) await Wait(timeOut);
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