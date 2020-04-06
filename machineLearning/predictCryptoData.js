//Import AWS
let aws_settings_1 = require("../aws-settings");

let AWS = require("aws-sdk");

//AWS class that will query endpoint
const awsRuntime = new AWS.SageMakerRuntime({});

// End points name to connect to
const endpointName = "crypto-endpoint";

// data to send to ML to generate the prediction
const NUMBER_OF_SAMPLES = 80;

// used tables
const CURRENCY_TABLE = "crypto";
const PREDICTION_TABLE = "predictions";

// Utilities for time manipulation
const ONE_HOUR = 3600;
const HUNDRED_HOUR = ONE_HOUR * 100;

//predictions parameters
const typesOfPrediction = ["mean", "quantiles"];
const details = ["0.1", "0.9"];

// currency to search in table of transactions
const coins = ["bitcoin", "ethereum", "litecoin", "monero", "tron"];

// map from coin type to their category for the machine learning object
const coinToCat = {
    "bitcoin": 0,
    "ethereum": 1,
    "litecoin": 2,
    "monero": 3,
    "tron": 4
};

// Unchanged part of the object to send to SageMaker
const configurationParam = {
    "num_samples": NUMBER_OF_SAMPLES,
    "output_types": ["mean", "quantiles"],
    "quantiles": ["0.1", "0.9"]
};

// Get a unix date 1585819800 and return "2020-01-10 19:00:00". Format needed for the objects to send to AWS SageMaker
const convertDataToAWSFormat = (date) => {
    const newTime = new Date(date * 1000);
    const seconds = "00";
    let minutes = newTime.getMinutes();
    minutes = minutes.toString().length === 1 ? minutes = "0" + minutes : minutes;
    let hour = newTime.getHours();
    hour.toString().length === 1 ? hour = "0" + hour : hour;
    let day = newTime.getDate();
    day.toString().length === 1 ? day = "0" + day : day;
    let month = newTime.getMonth();
    month++;
    month.toString().length === 1 ? month = "0" + month : month;
    const year = newTime.getFullYear();
    return (year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds);
};

// Take a list of transactions [{"CurrencyName": "bitcoin", "TimeTransaction":"1585819800", "Price":"1"}, {"CurrencyName":...},...]
// Return a transaction object to add to the list of transactions
// Transaction = {"start":"2020-01-10 19:0:00", "cat": 0, "target":[1, 4, 2, ...]}
const generateInstance = (cryptoTransactionList) => {
    let instance = {};

    // Take the last transaction date, which is the first in time
    let start = cryptoTransactionList[NUMBER_OF_SAMPLES - 1].TimeTransaction;
    start = convertDataToAWSFormat(start);
    instance.start = start;

    // Use the map coin to category to retrieve the value of the category to assign to
    let catValue = coinToCat[cryptoTransactionList[0].CurrencyName];
    instance.cat = catValue;
    instance.target = [];

    // For each transaction, add its price to the list of target.
    // Because we receive a list from the most recent to the oldest, we need to use unshift to add the prices to the target
    for(const transaction of cryptoTransactionList){
        instance.target.unshift(transaction.Price);
    }
    return instance;
};

// Make a list of instances for the body of the object to send to the endpoint
// "instances: [{instance}, {instance}]
const makeInstancesList = (allCrypto) => {
    let instances = [];
    try{
        for(const cryptoTransaction of allCrypto){
            let instance = generateInstance(cryptoTransaction);
            instances.push(instance);
        }
    } catch(e){
        console.error(`Error making instances list.`, e);
    }
    return instances;
};

// Return the param to search the transaction for one type of currency,
// that happens before a certain time (often current time).
const searchLastCryptoParam = (currency, timeTransaction) => {
    let condition = "CurrencyName = :c ";
    condition += "AND TimeTransaction < :ts ";
    return {
        TableName: CURRENCY_TABLE,
        IndexName: "CurrencyName-TimeTransaction-index",
        ScanIndexForward: false,
        KeyConditionExpression: condition,
        Limit: NUMBER_OF_SAMPLES,
        ExpressionAttributeValues: {
            ":c": currency,
            ":ts": timeTransaction
        }
    };
};

// Get the last transactions for all currencies
const searchLastCrypto = async() => {
    let resultCrypto = [];
    const currentTime = +new Date();

    for (const coin of coins) {
        const currParam = searchLastCryptoParam(coin, currentTime);
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

// Make the endpoint parameters to send to Sagemaker
const getEndpointParam = async (instancesList) => {
    let bodyOfParam =  {instances: instancesList, configuration: configurationParam};
    bodyOfParam = JSON.stringify(bodyOfParam);
    console.log(`bodyOfParam `, bodyOfParam);
    return {
        EndpointName: endpointName,
        Body:bodyOfParam,
        ContentType: "application/json",
        Accept: "application/json"
    };
};

// Parametes to be used to add the predictions to the table of predictions.
let newPredictionParam = (timeOfPrediction, keyword, prediction, typeOfPrediction) => {
    return {
        TableName: PREDICTION_TABLE,
        Item: {
            timePrediction: timeOfPrediction,
            typeOfData: keyword,
            predictedValue: prediction,
            typeOfPrediction: typeOfPrediction
        }
    }
};

const predictCryptoData = async () => {
    let allCrypto = await searchLastCrypto();
    let instancesList = makeInstancesList(allCrypto);
    let endpointParam = await getEndpointParam(instancesList);

    console.log(`endpointParam = `, endpointParam);
    console.log("Before the invokeEndpoint");

    // //Call endpoint and handle response
    awsRuntime.invokeEndpoint(endpointParam, (err, data)=>{

        console.log(`We're in the aws Run Time`);

        if (err) {//An error occurred
            console.log(err, err.stack);

            //Return error response
            const response = {
                statusCode: 500,
                body: JSON.stringify('ERROR: ' + JSON.stringify(err)),
            };
            return response;
        }
        else{//Successful response

            console.log(`data = `, data);
            //Convert response data to JSON
            let responseData = JSON.parse(Buffer.from(data.Body).toString('utf8'));
            console.log(JSON.stringify(responseData));

            //Return successful response
            const response = {
                statusCode: 200,
                body: JSON.stringify('Predictions stored.'),
            };
            return response;
        }
    });
};

predictCryptoData();

