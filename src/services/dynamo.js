require('dotenv').config();

let AWS = require('aws-sdk');
AWS.config.update({ 'region': process.env.REGION, 'accessKeyId': process.env.ACCESS_KEY_ID, 'secretAccessKey': process.env.AWS_SECRET_KEY });
let docClient = new AWS.DynamoDB.DocumentClient();
let table = 'nekotopia-userdata-dev';
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    docClient,
    table,
    dynamodb
  };