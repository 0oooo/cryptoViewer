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
var dotenv = require('dotenv');
var Twitter = require('twitter');
dotenv.config();
// Twitter API
var client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_SECRET_ACCESS_TOKEN
});
// List of currency to search in twitter
var keywords = ["bitcoin", "litecoin", "ethereum", "monero", "tron"];
//Search tweet by keyword (the currency) and put them in the tweitter database.
function searchTweets(keyword) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, result, tweets, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = {
                        q: keyword,
                        count: 120,
                        lang: "en"
                    };
                    return [4 /*yield*/, client.get('search/tweets', searchParams)];
                case 1:
                    result = _a.sent();
                    if (typeof result.statuses !== 'undefined' && result.statuses.length > 0) {
                        tweets = result.statuses;
                        tweets.forEach(function (tweet) {
                            console.log(tweet.id);
                            console.log(tweet.created_at);
                            console.log(tweet.text);
                            put_1.addTweetToDatabase(tweet.id, tweet.created_at, keyword, tweet.text);
                        });
                    }
                    else {
                        console.log("Nothing found");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log(JSON.stringify(error_1));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Search tweet for all currencies
exports.searchTweetsForAllCurrencies = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, keywords_1, keyword;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("search all");
                _i = 0, keywords_1 = keywords;
                _a.label = 1;
            case 1:
                if (!(_i < keywords_1.length)) return [3 /*break*/, 4];
                keyword = keywords_1[_i];
                // console.log(keyword);
                return [4 /*yield*/, searchTweets(keyword)];
            case 2:
                // console.log(keyword);
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=twitter-get-data.js.map