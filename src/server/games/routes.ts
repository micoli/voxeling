import * as Hapi from "hapi";
import * as Joi from "joi";
import GameController from "./game-controller";
import * as GameValidator from "./game-validator";
import { jwtValidator } from "../users/user-validator";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";

export default function (server: Hapi.Server, configs: IServerConfigurations, database: IDatabase) {

	const gameController = new GameController(configs, database);
	server.bind(gameController);

	server.route({
		method: 'GET',
		path: '/api/games/{id}',
		config: {
			handler: gameController.getGameById,
			auth: "jwt",
			tags: ['api', 'games'],
			description: 'Get game by id.',
			validate: {
				params: {
					id: Joi.string().required()
				},
				headers: jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Game founded.'
						},
						'404': {
							'description': 'Game does not exists.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/api/games',
		config: {
			handler: gameController.getGames,
			auth: "jwt",
			tags: ['api', 'games'],
			description: 'Get all games.',
			validate: {
				query: {
					top: Joi.number().default(5),
					skip: Joi.number().default(0)
				},
				headers: jwtValidator
			}
		}
	});

	server.route({
		method: 'DELETE',
		path: '/api/games/{id}',
		config: {
			handler: gameController.deleteGame,
			auth: "jwt",
			tags: ['api', 'games'],
			description: 'Delete game by id.',
			validate: {
				params: {
					id: Joi.string().required()
				},
				headers: jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Deleted Game.',
						},
						'404': {
							'description': 'Game does not exists.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'PUT',
		path: '/api/games/{id}',
		config: {
			handler: gameController.updateGame,
			auth: "jwt",
			tags: ['api', 'games'],
			description: 'Update game by id.',
			validate: {
				params: {
					id: Joi.string().required()
				},
				payload: GameValidator.updateGameModel,
				headers: jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Deleted Game.',
						},
						'404': {
							'description': 'Game does not exists.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'POST',
		path: '/api/games',
		config: {
			handler: gameController.createGame,
			auth: "jwt",
			tags: ['api', 'games'],
			description: 'Create a game.',
			validate: {
				payload: GameValidator.createGameModel,
				headers: jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'201': {
							'description': 'Created Game.'
						}
					}
				}
			}
		}
	});
}
