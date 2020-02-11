"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var put_1 = require("./put");
var axios = require('axios'); //http
var dotenv = require('dotenv'); //variable environments
//Copy variables in file into environment variables
dotenv.config();
var coins = {
    bitcoin: "BTC",
    litecoin: "LTC",
    ethereum: "ETH",
    monero: "XMR",
    tron: "TRX"
};
var currencies = {
    dollar: "USD"
};
var historicalURL = 'https://min-api.cryptocompare.com/data/v2/histominute';
var APIKey = '&api_key=' + process.env.CRYPTO_COMPARE_API_KEY;
var coinUrl = function (chosenCoin) { return "?fsym=" + chosenCoin; };
var currencyUrl = function (chosenCurrency) { return '&tsym=' + chosenCurrency; };
var limitUrl = function (limit) { return '&limit=' + limit; };
var getPricesPerMinute = function (crypto, curr, limit) { return __awaiter(void 0, void 0, void 0, function () {
    var url;
    return __generator(this, function (_a) {
        url = historicalURL + coinUrl(crypto) + currencyUrl(curr) + limitUrl(limit) + APIKey;
        return [2 /*return*/, axios.get(url)];
    });
}); };
var getPricesForAllCurrencies = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _i, coin, _c, _d, _e, currency, result, prices, listOfPrices, _f, listOfPrices_1, price, error_1;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _a = [];
                for (_b in coins)
                    _a.push(_b);
                _i = 0;
                _g.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 14];
                coin = _a[_i];
                _c = [];
                for (_d in currencies)
                    _c.push(_d);
                _e = 0;
                _g.label = 2;
            case 2:
                if (!(_e < _c.length)) return [3 /*break*/, 13];
                currency = _c[_e];
                _g.label = 3;
            case 3:
                _g.trys.push([3, 11, , 12]);
                return [4 /*yield*/, getPricesPerMinute(coins[coin], currencies[currency], "100")];
            case 4:
                result = _g.sent();
                prices = result["data"];
                if (!(prices.Response === "Success")) return [3 /*break*/, 9];
                listOfPrices = prices.Data["Data"];
                _f = 0, listOfPrices_1 = listOfPrices;
                _g.label = 5;
            case 5:
                if (!(_f < listOfPrices_1.length)) return [3 /*break*/, 8];
                price = listOfPrices_1[_f];
                return [4 /*yield*/, put_1.addTransactionToDatabase(price["time"], coin, price["close"])];
            case 6:
                _g.sent();
                _g.label = 7;
            case 7:
                _f++;
                return [3 /*break*/, 5];
            case 8: return [3 /*break*/, 10];
            case 9:
                console.log("Error: " + JSON.stringify(prices.Message));
                _g.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                error_1 = _g.sent();
                console.log("Error: " + JSON.stringify(error_1));
                return [3 /*break*/, 12];
            case 12:
                _e++;
                return [3 /*break*/, 2];
            case 13:
                _i++;
                return [3 /*break*/, 1];
            case 14: return [2 /*return*/];
        }
    });
}); };
getPricesForAllCurrencies().then(function () { return console.log("Done."); });
//# sourceMappingURL=crypto-compare-get-data.js.map