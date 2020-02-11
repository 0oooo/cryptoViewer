import {DownloadedCryptoObject} from "./crypto-interfaces";
import {addTransactionToDatabase} from "./put";

const axios = require ('axios'); //http
const dotenv = require('dotenv'); //variable environments

//Copy variables in file into environment variables
dotenv.config();

const coins:Object = {
    bitcoin: "BTC",
    litecoin: "LTC",
    ethereum: "ETH",
    monero: "XMR",
    tron: "TRX"
}

const currencies:Object = {
    dollar : "USD"
}

const historicalURL: string = 'https://min-api.cryptocompare.com/data/v2/histominute';

let APIKey: string = '&api_key=' + process.env.CRYPTO_COMPARE_API_KEY;

let coinUrl = (chosenCoin:string):string => {return "?fsym=" + chosenCoin};

let currencyUrl = (chosenCurrency:string):string => {return '&tsym=' + chosenCurrency};

let limitUrl = (limit:string):string => {return '&limit=' + limit};

let getPricesPerMinute = async (crypto:string, curr:string, limit:string): Promise<object> => {
    let url = historicalURL + coinUrl(crypto) + currencyUrl(curr) + limitUrl(limit) + APIKey;
    return axios.get(url);
}

let getPricesForAllCurrencies = async() => {
    for (let coin in coins){
        for(let currency in currencies){
            try{
                let result : object = await getPricesPerMinute(coins[coin], currencies[currency], "100");
                let prices : DownloadedCryptoObject = result["data"];

                if(prices.Response === "Success"){

                    let listOfPrices: Array<object> = prices.Data["Data"];
                    for (const price of listOfPrices) {
                        await addTransactionToDatabase(price["time"], coin, price["close"]);
                    }

                }else{
                    console.log("Error: " + JSON.stringify(prices.Message));
                }
            } catch(error){
                console.log("Error: " + JSON.stringify(error));
            }
        }
    }
}

getPricesForAllCurrencies().then(()=> console.log("Done."));
