"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws_settings_1 = require("./aws-settings");
// /* Retrieve all items with specified PriceTimeStamp */
// let params = {
//     TableName: "Cryptocurrency",
//     KeyConditionExpression: "TimeTransaction = :ts",
//     ExpressionAttributeValues: {
//         ":ts" : 1581340614437
//     }
// };
/* Use index to retrieve all items with specified currency */
// let params = {
//     TableName: "Cryptocurrency",
//     IndexName: "CurrencyName-index",
//     KeyConditionExpression: "CurrencyName = :curr",
//     ExpressionAttributeValues: {
//         ":curr" : "tron"
//     }
// };
/* Use index and expression to retrieve currencies with timestamp
    greater than specified value */
// let params = {
//     TableName: "Cryptocurrency",
//     IndexName: "CurrencyName-TimeTransaction-index",
//     KeyConditionExpression: "CurrencyName = :curr AND TimeTransaction > :ts",
//     ExpressionAttributeValues: {
//         ":curr" : "bitcoin",
//         ":ts" : 1581340646068
//     }
// };
/* Retrieves bitcoin items with price greater than 3800
    Price is not an indexed field. */
// let params = {
//     TableName: "Cryptocurrency",
//     KeyConditionExpression: "CurrencyName = :curr",
//     IndexName: "CurrencyName-index",
//     FilterExpression: "Price > :p",
//     ExpressionAttributeValues: {
//         ":curr" : "bitcoin",
//         ":p" : 3700
//     }
// };
/* Retrieves just the prices of the bitcoin items */
var params = {
    TableName: "Cryptocurrency",
    KeyConditionExpression: "CurrencyName = :curr",
    IndexName: "CurrencyName-TimeTransaction-index",
    ProjectionExpression: "Price",
    ExpressionAttributeValues: {
        ":curr": "bitcoin",
    }
};
//Run query and output result or handle errors
aws_settings_1.documentClient.query(params, function (err, data) {
    if (err) {
        console.error("Unable to read item", JSON.stringify(params));
        console.error("Error JSON:", JSON.stringify(err));
    }
    else {
        console.log("Data:", data);
    }
});
//# sourceMappingURL=query.js.map