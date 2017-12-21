"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const game_controller_1 = require("./game-controller");
const GameValidator = require("./game-validator");
const user_validator_1 = require("../users/user-validator");
function default_1(server, configs, database) {
    const gameController = new game_controller_1.default(configs, database);
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
                headers: user_validator_1.jwtValidator
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
                headers: user_validator_1.jwtValidator
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
                headers: user_validator_1.jwtValidator
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
                headers: user_validator_1.jwtValidator
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
                headers: user_validator_1.jwtValidator
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
exports.default = default_1;
