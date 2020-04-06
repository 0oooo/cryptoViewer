/**
 * Connect to Crypto-compare API and pull the latest transactions
 * For Bitcoin, Litecoin, Ethereum, Monero, and Tron
 */

import {CryptoPrice, DownloadedCryptoObject} from "./crypto-interfaces";
import {addTransactionToDatabase} from "./put";

const axios = require('axios'); //http
const dotenv = require('dotenv'); //variable environments

//Copy variables in file into environment variables
dotenv.config();

// list of currency and their name in the API
const coins: object = {
    bitcoin: "BTC",
    litecoin: "LTC",
    ethereum: "ETH",
    monero: "XMR",
    tron: "TRX"
};

// In case I wanted to pull different prices
const currencies: object = {
    dollar: "USD"
};

// API key for the CryptoCompare API.
const API_BASE_URL: string = 'https://min-api.cryptocompare.com/data/v2';
const API_KEY: string = '&api_key=' + process.env.CRYPTO_COMPARE_API_KEY;

// get prices per minutes for the last 200 minutes
const getPricesPerMinute = async (coin: string, curr: string, limit = 200): Promise<object> => {
    const url = `${API_BASE_URL}/histominute?fsym=${coin}&tsym=${curr}&limit=${limit}${API_KEY}`;

    return axios.get(url);
};

// Get all the prices for all the currencies selected from the API CryptoCompare
export const getPricesForAllCurrencies = async () => {
    for (let coin in coins) {
        for (let currency in currencies) {
            try {
                let result: object = await getPricesPerMinute(coins[coin], currencies[currency]);
                let prices: DownloadedCryptoObject = result["data"];

                if (prices.Response === "Success") {

                    let listOfPrices: Array<CryptoPrice> = prices.Data["Data"];
                    for (const price of listOfPrices) {
                        await addTransactionToDatabase(price.time, coin, price.close);
                    }

                } else {
                    console.log("Error: " + JSON.stringify(prices.Message));
                }
            } catch (error) {
                console.log("Error: " + JSON.stringify(error));
            }
        }
    }
}

