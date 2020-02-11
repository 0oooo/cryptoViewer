"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
//Create new DocumentClient
exports.documentClient = new AWS.DynamoDB.DocumentClient();
//# sourceMappingURL=aws-settings.js.map