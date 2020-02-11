"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws_settings_1 = require("./aws-settings");
//Table name and data for table
var params = {
    TableName: "Cryptocurrency",
    Key: {
        TimeTransaction: 1581340614437
    }
};
//Retrieve data item from DynamoDB and handle errors
aws_settings_1.documentClient.get(params, function (err, data) {
    if (err) {
        console.error("Unable to read item", params.Key.TimeTransaction);
        console.error("Error JSON:", JSON.stringify(err));
    }
    else {
        console.log("Data:", data);
    }
});
//# sourceMappingURL=get.js.map