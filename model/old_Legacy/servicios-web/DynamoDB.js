const AWS = require('aws-sdk');
AWS.config = new AWS.Config(  {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1"
});

class DynamoDB {
  constructor () {
    this.DB = new AWS.DynamoDB();

  }


}