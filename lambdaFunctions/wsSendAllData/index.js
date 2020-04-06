const AWS = require("aws-sdk");

//Create new DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

// constant for getting the data from now in crypto table
const CRYPTO_TABLE = "crypto";
const HUNDRED_MIN_IN_MS = 6000000;
const ONE_HOUR_IN_MS = 3600000;

// constant for plotly objects formatting
const PLOTLY_MODE = "lines";
const PLOTLY_COLOR = "rgb(29, 97, 142)";
const PLOTLY_SIZE = 12;

// number of data we're getting for each coin
const NUMBER_OF_DATA_TO_RETRIEVE = 100;

//Import external library with websocket functions
const ws = require('websocket');

//Hard coded domain name and stage - use when pushing messages from server to client
let domainName = "k0caafmtbf.execute-api.us-east-1.amazonaws.com";
let stage = "dev";

const coins = ["bitcoin", "ethereum", "litecoin", "monero", "tron"];

const SENTIMENT_TABLE = "sentiment";

// sentiment parameter to search by keyword ("bitcoin") and by time
const searchSentimentParam = (keyword, lastHour) => {
    let condition = "keyword = :keyw ";
    condition += "AND timeTweet > :ts";
    return {
        TableName: SENTIMENT_TABLE,
        IndexName: "keyword-timeTweet-index",
        KeyConditionExpression: condition,
        ExpressionAttributeValues: {
            ":keyw": keyword,
            ":ts": lastHour
        }
    };
};
// Search sentiment by time (all sentiments of the last hour) and by currency
// Return an object of sentiment to number of time that sentiment was found
// Example: "bitcoin": {"positive": 3, "negative": 12, "neutral": 87, "mixed": 1}
const searchSentiment = async() => {
    let currentTime = +new Date();
    let lastHour = currentTime - ONE_HOUR_IN_MS;
    let sentiments = {};
    sentiments.type = "sentiment-data";
    for (let coin in coins) {
        let currency = coins[coin];
        let sentiment = {
            "positive": 0,
            "negative": 0,
            "neutral": 0,
            "mixed": 0
        };

        let currParam = searchSentimentParam(coins[coin], lastHour);
        try {
            let results = await documentClient.query(currParam).promise();
            for (const result of results.Items) {
                switch (result.sentiment) {
                    case 1:
                        sentiment.positive++;
                        break;
                    case 2:
                        sentiment.negative++;
                        break;
                    case 3:
                        sentiment.neutral++;
                        break;
                    case 4:
                        sentiment.mixed++;
                        break;
                    default:
                        throw "Unknown sentiment";
                }

            }
            sentiments[currency] = sentiment;
        }
        catch (e) {
            console.error(`Error in searchAllCrypto query for coin: ${coin}`, e);
        }
    }
    return sentiments;
};

// Search crypto currency parameters. For search by currency name and by time.
const searchCryptoParam = (currency, lastTime) => {
    let condition = "CurrencyName = :curr ";
    condition += "AND TimeTransaction < :ts ";
    return {
        TableName: CRYPTO_TABLE,
        IndexName: "CurrencyName-TimeTransaction-index",
        Limit: NUMBER_OF_DATA_TO_RETRIEVE,
        ScanIndexForward: false,
        KeyConditionExpression: condition,
        ExpressionAttributeValues: {
            ":curr": currency,
            ":ts": lastTime
        }
    };
};

// Search every cryptocurrency
const searchAllCrypto = async() => {
    let resultCrypto = [];
    let currentTime = +new Date();
    let lastTime = currentTime - HUNDRED_MIN_IN_MS;

    for (let coin in coins) {
        let currParam = searchCryptoParam(coins[coin], lastTime);
        try {
            let result = await documentClient.query(currParam).promise();
            resultCrypto.push(result.Items);
        }
        catch (e) {
            console.error(`Error in searchAllCrypto query for coin: ${coin}`, e);
        }
    }
    return resultCrypto;
};

//Formatting of the time to only get the hours and minutes to display on the plotly graph
let getHoursAndMinutes = (date) => {
    let newTime = new Date(date * 1000);
    let minutes = newTime.getMinutes();
    minutes.toString().length == 1 ? minutes = "0" + minutes : minutes;
    let hour = newTime.getHours();
    return (hour + ":" + minutes);
};

// get an array of data and turn it into a plotly object
// plotlyObject = {
//     x: [4,5,4,2,4,5,6,6 7,7,7],
//     y: [4,3,4,5,6,66,7,7,7,7],
//     mode: "lines";
//     name: "My Graph",
//     marker: {
//         color: "rgb(29, 97, 142)"
//         size: 12
//     }

const plotlyDataFormatter = (dataArrayToFormat) => {
    let plotlyData = {};
    plotlyData.type = "numerical-data";

    for (let index in dataArrayToFormat) {
        let dataToFormat = dataArrayToFormat[index];
        let currency = dataToFormat[0].CurrencyName;
        let plotlyObject = {
            x: [],
            y: [],
            mode: PLOTLY_MODE,
            name: "",
            marker: {
                color: PLOTLY_COLOR,
                size: PLOTLY_SIZE
            }
        };

        for (let data in dataToFormat) {
            plotlyObject.x.unshift(getHoursAndMinutes(dataToFormat[data].TimeTransaction));
            plotlyObject.y.unshift(dataToFormat[data].Price);
            plotlyObject.name = dataToFormat[data].CurrencyName;
        }
        plotlyData[currency] = plotlyObject;
    }
    return plotlyData;
}

exports.handler = async(event) => {
    try {
        console.log(event);

        let plotlyObjectToSend = plotlyDataFormatter(await searchAllCrypto());

        let sendMsgPromises = await ws.getSendMessagePromises(JSON.stringify(plotlyObjectToSend), domainName, stage);

        //Execute promises
        await Promise.all(sendMsgPromises);

        let sentimentsToSend = await searchSentiment();

        let sendSentimentPromises = await ws.getSendMessagePromises(JSON.stringify(sentimentsToSend), domainName, stage);

        await Promise.all(sendSentimentPromises);
    }
    catch (err) {
        console.log('We errored here', err);
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};
