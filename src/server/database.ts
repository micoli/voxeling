import * as Mongoose from "mongoose";
import { IDataConfiguration } from "./configurations";
import { IUser, UserModel } from "./users/user";
import { IGame, GameModel } from "./games/game";

export interface IDatabase {
	userModel: Mongoose.Model<IUser>;
	gameModel: Mongoose.Model<IGame>;
}

export function init(config: IDataConfiguration): IDatabase {

	(<any>Mongoose).Promise = Promise;
	console.log(config);
	Mongoose.connect(process.env.MONGO_URL || config.connectionString , {
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
		gameModel: GameModel,
		userModel: UserModel
	};
}
