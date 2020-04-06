/**
 * AWS setting to connect to dynamo db. Export documentClient
 */
let AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

//Create new DocumentClient
export let documentClient = new AWS.DynamoDB.DocumentClient();
