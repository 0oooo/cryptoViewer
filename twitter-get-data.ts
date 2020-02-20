import {DownloadedTweet, TwitterResult} from "./twitter-interface";
import {addTweetToDatabase} from "./put";
const dotenv = require('dotenv');
const Twitter = require('twitter');
dotenv.config();

let client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_SECRET_ACCESS_TOKEN
});

//Downloads and outputs tweet text
async function searchTweets(keyword: string){
    try{
        //Set up parameters for the search
        let searchParams = {
            q: keyword,
            count: 3,
            lang: "en"
        };

        //Wait for search to execute asynchronously
        let result: TwitterResult = await client.get('search/tweets', searchParams);

        if(typeof result.statuses !== 'undefined' && result.statuses.length > 0 ){

            let tweets: [DownloadedTweet] = result.statuses;

            tweets.forEach((tweet: DownloadedTweet) =>{
                console.log(tweet.id)
                console.log(tweet.created_at);
                console.log(tweet.text);
                addTweetToDatabase(tweet.id, tweet.created_at, keyword , tweet.text);
                })
        }
        else{
            console.log("Nothing found");
        }
    }
    catch(error){
        console.log(JSON.stringify(error));
    }
}

const keywords : Array<string>  = ["bitcoin", "litecoin", "ethereum", "monero", "tron"];

let searchAllCurrencies = async () => {
    console.log("search all");
    for (const keyword of keywords) {
        // console.log(keyword);
        await searchTweets(keyword);
    }
}

// //PromiseAll version
// let searchAllCurrencies = async () => {
//     //Array to hold promises
//     let promiseArray: Array<Promise<void>> = [];
//
//     for (const keyword of keywords) {
//         promiseArray.push(searchTweets(keyword));
//         // await searchTweets(keyword);
//     }
//
//
//     let databaseResult: Array<void> = await Promise.all(promiseArray);
//     console.log("Database result: " + JSON.stringify(databaseResult));
// }


searchAllCurrencies();