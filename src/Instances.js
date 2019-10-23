const fs = require('fs');

const Bot = require('../model/Classes/Bot');
const Facebook = require('../model/Classes/Facebook');
const dialogflow = require('../model/Classes/Dialogflow');
const MySQLDataBase = require('../model/Classes/MySQLDataBase');
const s3 = require('../model/Classes/S3');

const awsKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = 'us-east-1';
const bucket = process.env.S3_BUCKET_NAME;
const S3 = new s3(awsKey, awsSecretKey, region, bucket);

const tokenFB = process.env.FACEBOOK_TOKEN;
const versionAPI = '4.0';
const FB = new Facebook(tokenFB, versionAPI);

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const DialogFlowString = process.env.DIALOGFLOW;
console.log(path, DialogFlowString);
fs.writeFileSync(path, DialogFlowString);
const projectId = JSON.parse(DialogFlowString)['project_id'];
console.log(projectId);
const language = 'es';
const Dialogflow = new dialogflow(projectId, language);

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PASS;
const db = process.env.MYSQL_DB;
const port = process.env.MYSQL_PORT;
const MySQL = new MySQLDataBase(host, user, pass, db, port);

const AcademiBot = new Bot();
AcademiBot.setDataBase(MySQL);
AcademiBot.setFileStorage(S3);
AcademiBot.setMessagingChannel(FB);
AcademiBot.setNLPMotor(Dialogflow);
AcademiBot.init()
    .then(() => console.log('running.'))
    .catch(e => {
        console.log(e);
        process.exit(0);
    });

module.exports = {AcademiBot, FB, MySQL, Dialogflow, S3};