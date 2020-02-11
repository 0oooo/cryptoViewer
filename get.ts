import {documentClient} from './aws-settings';

//Table name and data for table
let params = {
    TableName: "Cryptocurrency",
    Key: {
        TimeTransaction: 1581340614437
    }
};

//Retrieve data item from DynamoDB and handle errors
documentClient.get(params, (err, data) => {
    if (err) {
        console.error("Unable to read item", params.Key.TimeTransaction);
        console.error("Error JSON:", JSON.stringify(err));
    } else {
        console.log("Data:", data);
    }
});
