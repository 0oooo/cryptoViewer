import {documentClient} from './aws-settings';
import {CryptoObjectToSave} from "./crypto-interfaces";

const TABLE = "crypto"

let putParameters = (timestamp: number, currency: string, price: number): object => {
    return {
        TableName: TABLE,
        Item: {
            TimeTransaction: timestamp, //Current time in milliseconds
            CurrencyName: currency,
            Price: price
        }
    }
}

export let addTransactionToDatabase =  async (timestamp: number, currency: string, price: number) => {

    let params : CryptoObjectToSave = putParameters(timestamp, currency, price);

    //Store data in DynamoDB and handle errors
    documentClient.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item", params.Item.CurrencyName);
            console.error("Error JSON:", JSON.stringify(err));
        } else {
            console.log("Currency added to table:", params.Item);
        }
    });
}