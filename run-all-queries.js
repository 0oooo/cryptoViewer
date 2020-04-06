"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var twitter_get_data_1 = require("./twitter-get-data");
var crypto_compare_get_data_1 = require("./crypto-compare-get-data");
// File to easily run both the crypto and twitter queries.
crypto_compare_get_data_1.getPricesForAllCurrencies().then(function () { return console.log("Done."); });
twitter_get_data_1.searchTweetsForAllCurrencies();
//# sourceMappingURL=run-all-queries.js.map