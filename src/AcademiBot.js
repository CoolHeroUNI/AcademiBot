const Bot = require('../model/Bot');


const amazondata = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
    nombre: process.env.S3_BUCKET_NAME
};
const AcademiBot = new Bot();
AcademiBot.carga()
    .catch(e => console.log(e));

module.exports = AcademiBot;