"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws_settings_1 = require("./aws-settings");
/* Deletes several items depending on their time transaction.*/
var params = {
    TableName: "Cryptocurrency",
    Key: {
        TimeTransaction: 1581340646068
        // CurrencyName: "bitcoin"
    }
    // KeyConditionExpression: "TimeTransaction < :ts",
    // ExpressionAttributeValues: {
    //     ":ts" : 1581340646068
    // }
};
//Deletes the specified item
aws_settings_1.documentClient.delete(params, function (err, data) {
    if (err) {
        console.error("Unable to delete item: ", JSON.stringify(params));
        console.error("Error JSON:", JSON.stringify(err));
    }
    else {
        console.log("Successful delete of item: " + JSON.stringify(params));
    }
});
//# sourceMappingURL=delete.js.map