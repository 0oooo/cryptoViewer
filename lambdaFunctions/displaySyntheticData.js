const AWS = require("aws-sdk");

//Create new DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

//Axios will handle HTTP requests to web service
const axios = require ('axios');

//The ID of the student's data that I will download
let studentID = 'M00603975';

//URL where student data is available
let url = 'https://wi02tm8hpe.execute-api.us-east-1.amazonaws.com/dev/';

//Authentication details for Plotly
const PLOTLY_USERNAME = 'CamiloCrocodilu';
const PLOTLY_KEY = 'jYqyzGreIOZo3r3dyydu';

//Initialize Plotly with user details.
let plotly = require('plotly')(PLOTLY_USERNAME, PLOTLY_KEY);

//Plotly parameters
const mean_color = "rgb(106, 68, 7)";
const ten_color = "rgb(106, 7, 98)";
const ninety_color = "rgb(7, 90, 106)";
const PLOTLY_MODE = "lines";
const PLOTLY_SIZE = 12;

//Prediction parameters
const PREDICTION_TABLE = "predictions";
const typesOfPrediction = ["mean", "0.1", "0.9"];
const START_OF_THE_PREDICTION = 1559397600;

// Parameters for the predictions for the synthetic data.
const searchSyntheticParam = (typeOfData, typeOfPredicition) => {
    let cond = "typeOfPrediction = :typ";
    cond += " AND timePrediction >= :tim";
    return {
        TableName: PREDICTION_TABLE,
        IndexName: "typeOfPrediction-timePrediction-index",
        ScanIndexForward: true,
        KeyConditionExpression: cond,
        FilterExpression: "typeOfData = :td",
        ExpressionAttributeValues: {
            ":td": typeOfData,
            ":typ": typeOfPredicition,
            ":tim": START_OF_THE_PREDICTION
        }
    };
};

// Retrieve the prediction for synthetic data.
const searchSyntheticPrediction = async () => {
    let resultPrediction = [];
    let typeOfData = "synthetic";
    for (const typeOfPrediction of typesOfPrediction) {
        try{
            let result = await documentClient.query(searchSyntheticParam(typeOfData, typeOfPrediction)).promise();
            // console.log(`Result = ${JSON.stringify(result)}`);
            resultPrediction.push(result);
        } catch (e) {
            console.error(`Error retrieving ${typeOfData} data of type ${typeOfPrediction}.`, e);
        }
    }

    return resultPrediction;
};

// Fortmat the results of the predictions to a Plotly object that will generates a graph
const plotlyDataFormatter = (fullResult, predictionType) => {
    // Prepare the plotly object to fill
    let color = predictionType === "mean"? mean_color : predictionType === "0.1"? ten_color : ninety_color;
    let plotlyObject = {
        x: [],
        y: [],
        mode: PLOTLY_MODE,
        name: predictionType,
        marker: {
            color: color,
            size: PLOTLY_SIZE
        }
    };

    let dataToFormat = [];
    try{
        for(let i = 0; i < fullResult.length; i++){
            if(fullResult[i].Items[0].typeOfPrediction == predictionType){
                dataToFormat = fullResult[i].Items;
                // console.log(`We got the data to format ${JSON.stringify(dataToFormat)}`);
                break;
            }
        }

        let hours = 500;
        dataToFormat.forEach(data => {
            // console.log(`The object we are looking at now: ${JSON.stringify(data)}`);
            plotlyObject.x.push(hours);
            plotlyObject.y.push(data.predictedValue);
            hours++;
        });

        //  console.log(`Final objet obtained = ${JSON.stringify(plotlyObject)}`);
    }catch (e){
        console.error(`Error creating a plotly object.`, e);
    }
    return plotlyObject;
};

//Plots the specified data
async function plotData(studentID, xValues, yValues){
    //Data structure
    let studentData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: 'line',
        name: studentID,
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };

    let data = [studentData];

    try{
        // Add the predictions to the data to turn to graph
        let resultsPrediction = await searchSyntheticPrediction();
        // console.log(`Results = ${JSON.stringify(resultsPrediction)}`);

        let meanData = plotlyDataFormatter(resultsPrediction, "mean");
        console.log(`Mean data = ${JSON.stringify(meanData)}`);
        data.push(meanData);
        let tenData =  plotlyDataFormatter(resultsPrediction, "0.1");
        data.push(tenData);
        let ninetyData = plotlyDataFormatter(resultsPrediction, "0.9");
        data.push(ninetyData);

    }catch (e){
        console.error(`Error getting the synthetic data.`, e);
    }

    let layout = {
        title: "Synthetic Data for Student " + studentID,
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };
    let graphOptions = {
        layout: layout,
        filename: "date-axes",
        fileopt: "overwrite"
    };

    return new Promise ( (resolve, reject)=> {
        plotly.plot(data, graphOptions, function (err, msg) {
            if (err)
                reject(err);
            else {
                resolve(msg);
            }
        });
    });
};

exports.handler = async (event) => {
    try {
        //Get synthetic data
        let yValues = (await axios.get(url + studentID)).data.target;

        //Add basic X values for plot
        let xValues = [];
        for(let i=0; i<yValues.length; ++i){
            xValues.push(i);
        }

        //Call function to plot data
        let plotResult = await plotData(studentID, xValues, yValues);
        console.log("Plot for student '" + studentID + "' available at: " + plotResult.url);

        return {
            statusCode: 200,
            body: "Ok"
        };
    }
    catch (err) {
        console.log("ERROR: " + JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Error plotting data for student ID: " + studentID
        };
    }
};


exports.handler({});