import {documentClient} from './aws-settings';

/* Deletes several items depending on their time transaction.*/
let params = {
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
documentClient.delete(params, (err, data) => {
    if (err) {
        console.error("Unable to delete item: ", JSON.stringify(params));
        console.error("Error JSON:", JSON.stringify(err));
    }
    else {
        console.log("Successful delete of item: " + JSON.stringify(params));
    }
});

