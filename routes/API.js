const {S3, MySQL} = require('../src/Instances');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const action = req.query['action'];
    switch (action) {
        case 'download':
            const key = req.query['key'];
            return S3.getObject(key)
                .then(data => res.send(data.Body))
                .catch(e => {
                    MySQL.logInternalError(e, 'API');
                    res.sendStatus(500)
                });
        default:
            res.sendStatus(405);
    }
});
module.exports = router;