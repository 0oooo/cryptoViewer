import {searchTweetsForAllCurrencies} from "./twitter-get-data";
import {getPricesForAllCurrencies} from "./crypto-compare-get-data";

// File to easily run both the crypto and twitter queries.

getPricesForAllCurrencies().then(() => console.log("Done."));

searchTweetsForAllCurrencies();