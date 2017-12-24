"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mongoose = require("mongoose");
const user_1 = require("./users/user");
const game_1 = require("./games/game");
function init(config) {
    Mongoose.Promise = Promise;
    console.log(config);
    Mongoose.connect(process.env.MONGO_URL || config.connectionString, {
        useMongoClient: true
    });
    let mongoDb = Mongoose.connection;
    mongoDb.on('error', () => {
        console.log(`Unable to connect to database: ${config.connectionString}`);
    });
    mongoDb.once('open', () => {
        console.log(`Connected to database: ${config.connectionString}`);
    });
    return {
        gameModel: game_1.GameModel,
        userModel: user_1.UserModel
    };
}
exports.init = init;
