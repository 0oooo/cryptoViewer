import {documentClient} from './aws-settings';
import {CryptoObjectToSave} from "./crypto-interfaces";
import {TweetObjectToSave} from "./twitter-interface";

const CRYPTO_TABLE = "crypto"
const TWEET_TABLE = "twitter"

let putCryptoParameters = (timestamp: number, currency: string, price: number): object => {
    return {
        TableName: CRYPTO_TABLE,
        Item: {
            TimeTransaction: timestamp, //Current time in milliseconds
            CurrencyName: currency,
            Price: price
        }
    }
}

export let addTransactionToDatabase =  async (timestamp: number, currency: string, price: number) => {

    let params : CryptoObjectToSave = putCryptoParameters(timestamp, currency, price);

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

let putTweeterParameters = (id:number, createdDate:string, keyword:string, tweet:string): object => {
    return {
        TableName: TWEET_TABLE,
        Item: {
            id: id,
            creationDate: createdDate,
            keyword: keyword,
            tweet: tweet
        }
    }
}

export let addTweetToDatabase = async(id:number, createdDate:string, keyword:string, tweet:string) =>{
    let params:TweetObjectToSave = putTweeterParameters(id, createdDate, keyword, tweet);

    //Store data in DynamoDB and handle errors
    documentClient.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add tweet ", params.Item.tweet);
            console.error("Error JSON:", JSON.stringify(err));
        } else {
            console.log("Tweet added to table:", params.Item);
        }
    });
}