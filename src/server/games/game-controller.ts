import * as Hapi from "hapi";
import * as Boom from "boom";
import { IGame } from "./game";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";

export default class GameController {

	private database: IDatabase;
	private configs: IServerConfigurations;

	constructor(configs: IServerConfigurations, database: IDatabase) {
		this.configs = configs;
		this.database = database;
	}

	public async createGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		let userId = request.auth.credentials.id;
		var newGame: IGame = request.payload;
		newGame.userId = userId;

		try {
			let game: IGame = await this.database.gameModel.create(newGame);
			return reply(game).code(201);
		} catch (error) {
			return reply(Boom.badImplementation(error));
		}
	}

	public async updateGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		let userId = request.auth.credentials.id;
		let id = request.params["id"];

		try {
			let game: IGame = await this.database.gameModel.findByIdAndUpdate(
				{ _id: id, userId: userId },
				{ $set: request.payload },
				{ new: true }
			);

			if (game) {
				reply(game);
			} else {
				reply(Boom.notFound());
			}

		} catch (error) {
			return reply(Boom.badImplementation(error));
		}
	}

	public async deleteGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		let id = request.params["id"];
		let userId = request.auth.credentials.id;

		let deletedGame = await this.database.gameModel.findOneAndRemove({ _id: id, userId: userId });

		if (deletedGame) {
			return reply(deletedGame);
		} else {
			return reply(Boom.notFound());
		}
	}

	public async getGameById(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		let userId = request.auth.credentials.id;
		let id = request.params["id"];

		let game = await this.database.gameModel.findOne({ _id: id, userId: userId }).lean(true);

		if (game) {
			reply(game);
		} else {
			reply(Boom.notFound());
		}
	}

	public async getGames(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		let userId = request.auth.credentials.id;
		let top = request.query['top'];
		let skip = request.query['skip'];
		let games = await this.database.gameModel.find({ userId: userId }).lean(true).skip(skip).limit(top);

		return reply(games);
	}
}
