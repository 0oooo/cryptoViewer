//Import AWS
const AWS = require("aws-sdk");

const documentClient = new AWS.DynamoDB.DocumentClient();

//AWS class that will query endpoint
const awsRuntime = new AWS.SageMakerRuntime({});

// End points name to connect to
const endpointName = "synth-test1";

// Hard coded last 100 points of synthetic data
const endpointData = {
    "instances":
        [
            {
                "start": "2019-05-28 9:00:00",
                "target": [722.5136720638302,746.759604438488,718.4255421828701,790.5972396969692,775.6144976901255,756.2794341949526,780.1601304556245,810.7078770964255,802.2498260349508,843.763710683294,867.971243341403,897.640350694091,896.8566751484607,886.1443482396522,917.9990683053034,854.4671529943238,903.0467595830409,847.2080051833834,829.0271317582009,857.2284074795083,811.8144964500405,819.0402022108157,783.754447906896,816.1555706833597,785.6953849299618,755.1526424695012,782.7878691452813,812.6710739754897,834.1885007953105,832.4393714528712,827.0356618997007,816.3417378347852,861.9351745008945,896.1385260391053,874.6947232283682,881.8402576646092,919.878992229689,938.1967039561788,953.3173618609156,931.466769523421,880.8620786895841,875.5267731190582,930.8972718657791,884.4702078999799,889.5810056897692,823.2998072053903,818.42418466199,789.7382629067823,817.1267449215968,787.172688226608,803.5872568123614,800.3901809787578,848.6323090280455,826.5093610007698,837.9909869933792,826.6349760310696,916.1671209613294,938.9296068248003,877.9072331922079,934.2884708903839,929.2687929924825,932.542433880513,981.7726774558819,949.4540539969585,955.127885529402,952.775100316134,875.9724970585299,912.9601368172014,917.1457733563694,888.7436864357546,841.3495291665349,820.6959009833661,827.1708089535884, 837.9834328840574,840.6006251147328,863.9729992844265,843.4173222742609,839.0731625058086,871.714664055779,926.3694764357786,885.9344030051891,952.2490910401336,981.1982387472449,993.8752692517133,992.4616367172632,968.1137214955808,932.0414650358368,984.8380951727943,969.5982939506883,955.4329869404452,964.9790381410972,922.453880733665,914.8926635890388,896.0788559617466,869.304288244467,929.133432272304,845.566140591311,844.6251739245845,854.8365301035008,848.436533200085]
            }
        ],
    "configuration":
        {
            "num_samples": 50,
            "output_types": ["mean", "quantiles"],
            "quantiles": ["0.1", "0.9"]
        }
};

// Endpoint object to send to AWS SageMaker
const params = {
    EndpointName: endpointName,
    Body: JSON.stringify(endpointData),
    ContentType: "application/json",
    Accept: "application/json"
};

// Utilities for data manipulation
const start = "2019-05-28 9:00:00";

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); };
Date.time = function() { return Date.now().getUnixTime(); };

const parsedStartTime = new Date(start).getUnixTime();

const ONE_HOUR = 3600;
const HUNDRED_HOUR = ONE_HOUR * 100;

// Prediction parameters
const PREDICTION_TABLE = "predictions";
const TYPES_OF_PREDICTION = ["mean", "quantiles"];
const QUANTILE_DETAILS = ["0.1", "0.9"];

// Return the parameters to add to table of prediction
const newPredictionParam = (timeOfPrediction, keyword, prediction, typeOfPrediction) => {
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

// Add each prediction to the database
const addPredictionToDB = async (predictionTime, prediction, detail) => {
    const predictionParam = newPredictionParam(predictionTime, "synthetic", prediction, detail);
    // console.log(`${JSON.stringify(predictionParam)}`);
    try{
        await documentClient.put(predictionParam).promise();
    }catch (e){
        console.error(`Error in putting ${predictionParam}`, e);
    }
};

// Get all prediction for one type ("mean", "0.1", "0.9") and call function to add them one by one to database.
const addPredictionPerTypeOfTransactionToDB = (allPredictionPerType, detail) => {
    let predictionTime = parsedStartTime + HUNDRED_HOUR - ONE_HOUR;
    allPredictionPerType.forEach(async prediction => {
        predictionTime += ONE_HOUR;
        await addPredictionToDB(predictionTime, prediction, detail);
    });
};

// Get all the predictions and sort if they are quantiles 0.1, quantiles 0.9 or mean. Then call function to add to DB
const addPredictionsToDB = (responseData, typeOfTransaction) => {
    if(typeOfTransaction === "quantiles"){
        QUANTILE_DETAILS.forEach(detail => {
            const allPredictionPerType = responseData.predictions[0][typeOfTransaction][detail];
            addPredictionPerTypeOfTransactionToDB(allPredictionPerType, detail);

        });
    }else{
        const allPredictionPerType = responseData.predictions[0][typeOfTransaction];
        addPredictionPerTypeOfTransactionToDB(allPredictionPerType, typeOfTransaction);
    }
}

exports.handler = event => {

    console.log(`Params = `, params);

    //Call endpoint and handle response
    awsRuntime.invokeEndpoint(params, (err, data)=>{
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
            //Convert response data to JSON
            const responseData = JSON.parse(Buffer.from(data.Body).toString('utf8'));
            console.log(JSON.stringify(responseData));

            // Take each type of prediction ("quantiles", "mean") to add the predictions to the database
            TYPES_OF_PREDICTION.forEach(type => {
                addPredictionsToDB(responseData, type);
            });

            //Return successful response
            const response = {
                statusCode: 200,
                body: JSON.stringify('Predictions stored.'),
            };
            return response;
        }
    });
};
