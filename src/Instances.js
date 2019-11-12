const fs = require('fs');

const Bot = require('../model/Classes/Bot');
const Facebook = require('../model/Classes/Facebook');
const dialogflow = require('../model/Classes/Dialogflow');
const MySQLDataBase = require('../model/Classes/MySQLDataBase');
const s3 = require('../model/Classes/S3');

const awsKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET_NAME;
const S3 = new s3(awsKey, awsSecretKey, region, bucket);

const tokenFB = process.env.FACEBOOK_TOKEN;
const versionAPI = '3.3';
const FB = new Facebook(tokenFB, versionAPI);

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const DialogFlowString = process.env.GOOGLE_DIALOGFLOW_JSON;
fs.writeFileSync(path, DialogFlowString);
const projectId = JSON.parse(DialogFlowString)['project_id'];
const language = process.env.GOOGLE_DIALOGFLOW_LANG;
const Dialogflow = new dialogflow(projectId, language);

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PASS;
const db = process.env.MYSQL_DB;
const port = process.env.MYSQL_PORT;
const SQLtime = parseInt(process.env.MYSQL_CACHE_TIME);
const MySQL = new MySQLDataBase(host, user, pass, db, port, SQLtime);

const greetings = process.env.ACADEMIBOT_GREETINGS;
const mediaFolder = process.env.ACADEMIBOT_MEDIA_FOLDER;
const time = parseInt(process.env.ACADEMIBOT_CACHE_TIME) * 1000;
const reconTime = parseInt(process.env.ACADEMIBOT_DB_RECONNECTION_TIME) * 1000;
const AcademiBot = new Bot(time, greetings, mediaFolder);
AcademiBot.setDataBase(MySQL);
AcademiBot.setFileStorage(S3);
AcademiBot.setMessagingChannel(FB);
AcademiBot.setNLPMotor(Dialogflow);
AcademiBot.init(reconTime)
    .then(() => console.log('Successful connection to DataBase'))
    .catch(e => {
        console.log(e);
        process.exit(0);
    });

module.exports = {AcademiBot, FB, MySQL, Dialogflow, S3};