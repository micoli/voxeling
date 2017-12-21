"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Boom = require("boom");
class GameController {
    constructor(configs, database) {
        this.configs = configs;
        this.database = database;
    }
    createGame(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.auth.credentials.id;
            var newGame = request.payload;
            newGame.userId = userId;
            try {
                let game = yield this.database.gameModel.create(newGame);
                return reply(game).code(201);
            }
            catch (error) {
                return reply(Boom.badImplementation(error));
            }
        });
    }
    updateGame(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.auth.credentials.id;
            let id = request.params["id"];
            try {
                let game = yield this.database.gameModel.findByIdAndUpdate({ _id: id, userId: userId }, { $set: request.payload }, { new: true });
                if (game) {
                    reply(game);
                }
                else {
                    reply(Boom.notFound());
                }
            }
            catch (error) {
                return reply(Boom.badImplementation(error));
            }
        });
    }
    deleteGame(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = request.params["id"];
            let userId = request.auth.credentials.id;
            let deletedGame = yield this.database.gameModel.findOneAndRemove({ _id: id, userId: userId });
            if (deletedGame) {
                return reply(deletedGame);
            }
            else {
                return reply(Boom.notFound());
            }
        });
    }
    getGameById(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.auth.credentials.id;
            let id = request.params["id"];
            let game = yield this.database.gameModel.findOne({ _id: id, userId: userId }).lean(true);
            if (game) {
                reply(game);
            }
            else {
                reply(Boom.notFound());
            }
        });
    }
    getGames(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.auth.credentials.id;
            let top = request.query['top'];
            let skip = request.query['skip'];
            let games = yield this.database.gameModel.find({ userId: userId }).lean(true).skip(skip).limit(top);
            return reply(games);
        });
    }
}
exports.default = GameController;
