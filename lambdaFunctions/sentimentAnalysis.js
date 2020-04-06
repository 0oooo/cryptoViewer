let AWS = require("aws-sdk");

const SENTIMENT_TABLE = "sentiment";
let documentClient = new AWS.DynamoDB.DocumentClient();

function params(text) {
    return {
        LanguageCode: "en",//Possible values include: "en", "es", "fr", "de", "it", "pt"
        Text: text
    }
}

function getSentimentNumber(sentiment){
    switch(sentiment) {
        case "POSITIVE":
            return 1;
        case "NEGATIVE":
            return 2;
        case "NEUTRAL":
            return 3;
        case "MIXED":
            return 4;
        default:
            throw "Unknown sentiment";
    }
}

//Create instance of Comprehend
let comprehend = new AWS.Comprehend();

//Function that will be called
exports.handler = (event) => {


    console.log("EVENT = ", event);

    event.Records.forEach(async record => {
        if(record.eventName == "INSERT"){
            console.log("dynamodb = ", JSON.stringify(record.dynamodb));
            let tweet = JSON.stringify(record.dynamodb.NewImage.tweet.S);
            console.log("TWEET = ", tweet);
            params(tweet);

            let tweetId = JSON.stringify(record.dynamodb.NewImage.id.N);
            let tweetTime = JSON.stringify(record.dynamodb.NewImage.creationDate.S);
            tweetTime = Date.parse(tweetTime).valueOf();
            let keyword = JSON.stringify(record.dynamodb.NewImage.keyword.S);
            console.log("KeyWord before slicine = ", keyword);
            keyword = keyword.substring(1, keyword.length-1);
            console.log("KeyWord AFTER = ", keyword);


            try{
                //Call comprehend to detect sentiment of text
                let sentiment = await comprehend.detectSentiment(params(tweet)).promise();
                let sentimentScore = getSentimentNumber(sentiment.Sentiment);

                let newSentimentParam = {
                    TableName: SENTIMENT_TABLE,
                    Item: {
                        tweetid: tweetId,
                        keyword: keyword,
                        sentiment: sentimentScore,
                        timeTweet: tweetTime
                    }
                }

                documentClient.put(newSentimentParam, (err, data) => {
                    if (err) {
                        console.error("Unable to add item", newSentimentParam.Item.id);
                        console.error("Error JSON:", JSON.stringify(err));
                    } else {
                        console.log("Currency added to table:", newSentimentParam.Item);
                    }
                });

            }catch(error) {
                console.log(JSON.stringify(error));
            }
        }
    });
};


