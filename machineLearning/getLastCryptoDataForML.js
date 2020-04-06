// AWS setting to connect to DynamoDB
let aws_settings_1 = require("../aws-settings");

// FS is used to write new file (Here JSON)
const fs = require('fs');

// currency table
const CURRENCY_TABLE = "crypto";

// Number of data we want to get out of all the data we are pulling to train the ML.
const TRAIN_LIMIT = 120;

// list of coins to get the transactions
const coins = ["bitcoin", "ethereum", "litecoin", "monero", "tron"];

// Map coins name to category
let coinToCat = {
    "bitcoin": 0,
    "ethereum": 1,
    "litecoin": 2,
    "monero": 3,
    "tron": 4
};

// Parameters to search the last crypto transactions.
const searchLastCryptoParam = (currency, timeTransaction, numberOfData) => {
    let condition = "CurrencyName = :c ";
    condition += "AND TimeTransaction < :ts ";
    return {
        TableName: CURRENCY_TABLE,
        IndexName: "CurrencyName-TimeTransaction-index",
        ScanIndexForward: false,
        KeyConditionExpression: condition,
        Limit: numberOfData,
        ExpressionAttributeValues: {
            ":c": currency,
            ":ts": timeTransaction
        }
    };
};

// Search the last crypto transactions
const searchLastCrypto = async() => {
    let resultCrypto = [];
    let currentTime = +new Date();

    for (const coin of coins) {
        let currParam = searchLastCryptoParam(coin, currentTime, 200);
        try {
            let result = await aws_settings_1.documentClient.query(currParam).promise();
            resultCrypto.push(result.Items);
        }
        catch (e) {
            console.error(`Error in searchAllCrypto query for coin: ${coin}`, e);
        }
    }

    return resultCrypto;
};

// Convert a date 1535775300 to "2020-10-10 10:23:00"
let convertDataToAWSFormat = (date) => {
    let newTime = new Date(date * 1000);
    let seconds = "00";
    let minutes = newTime.getMinutes();
    minutes.toString().length == 1 ? minutes = "0" + minutes : minutes;
    let hour = newTime.getHours();
    let day = newTime.getDate();
    let month = newTime.getMonth();
    month++;
    month.toString().length == 1 ? month = "0" + month : month;
    let year = newTime.getFullYear();
    return (year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds);
};

// Take a testing object and return a truncated version of it (the target will have less value)
let makeTrainingObject = (testingObject) => {
    let mlObject = {
        "start":"",
        "cat": 0,
        "target": []
    };
    mlObject.start = testingObject.start;
    mlObject.cat = testingObject.cat;
    mlObject.target = testingObject.target.slice(0, TRAIN_LIMIT);
    return mlObject;
}

// Make JSON file out of the currency transactions pulled out of the database.
let makeJSON = async () => {
    let testingJSON = [];
    let trainingJSON = [];
    let mlObject = {
        "start":"",
        "cat": 0,
        "target": []
    };

    let allCrypto = await searchLastCrypto();
    for (const crypto of allCrypto){
        let testDataObject = {};
        let trainDataObject = {};

        let startingTime = crypto[199].TimeTransaction;
        startingTime = convertDataToAWSFormat(startingTime);
        testDataObject.start = startingTime;
        testDataObject.cat = coinToCat[crypto[0].CurrencyName];
        testDataObject.target = [];
        for(const transaction of crypto){
            testDataObject.target.unshift(transaction.Price);
        }
        trainDataObject = makeTrainingObject(testDataObject);

        testingJSON.push(testDataObject);
        trainingJSON.push(trainDataObject);
    }
    let testingData = JSON.stringify(testingJSON);
    testingData = testingData.substring(1, testingData.length - 1);
    // console.log(`TestinJSON = ${JSON.stringify(testingJSON)}`);
    fs.writeFileSync('testingData.json', testingData);

    let trainingData = JSON.stringify(trainingJSON);
    trainingData = trainingData.substring(1, trainingData.length - 1);
    fs.writeFileSync('trainingData.json', trainingData);
};

//JSON looks like:
// "start":"YYYY-MM-DD HH:MM:SS", "cat":0,"target":[8.67, 54.34,...]}

makeJSON();