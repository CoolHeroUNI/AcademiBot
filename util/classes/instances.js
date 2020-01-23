const fs = require('fs');

const Facebook = require('./Facebook');
const dialogflow = require('./Dialogflow');
const s3 = require('./S3');

const awsKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET_NAME;
const s3CacheTime = parseInt(process.env.AWS_S3_CACHE_TIME) * 1000;
const S3 = new s3(awsKey, awsSecretKey, region, bucket, s3CacheTime);

const tokenFB = process.env.FACEBOOK_TOKEN;
const versionAPI = '3.3';
const FB = new Facebook(tokenFB, versionAPI);

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const DialogFlowString = process.env.GOOGLE_DIALOGFLOW_JSON;
fs.writeFileSync(path, DialogFlowString);
const projectId = JSON.parse(DialogFlowString)['project_id'];
const language = process.env.GOOGLE_DIALOGFLOW_LANG;
const Dialogflow = new dialogflow(projectId, language);

module.exports = { FB, Dialogflow, S3 };