import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Joi from "joi";
import UserController from "./user-controller";
import {UserModel} from "./user";
import * as UserValidator from "./user-validator";
import {IDatabase} from "../database";
import {IServerConfigurations} from "../configurations";

export default function(server: Hapi.Server, serverConfigs: IServerConfigurations, database: IDatabase) {

	const userController = new UserController(serverConfigs, database);
	server.bind(userController);

	server.route({
		method: 'GET',
		path: '/api/users/info',
		config: {
			handler: userController.infoUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Get user info.',
			validate: {
				headers: UserValidator.jwtValidator,
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User founded.'
						},
						'401': {
							'description': 'Please login.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'DELETE',
		path: '/api/users',
		config: {
			handler: userController.deleteUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Delete current user.',
			validate: {
				headers: UserValidator.jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User deleted.',
						},
						'401': {
							'description': 'User does not have authorization.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'PUT',
		path: '/api/users',
		config: {
			handler: userController.updateUser,
			auth: "jwt",
			tags: ['api', 'users'],
			description: 'Update current user info.',
			validate: {
				payload: UserValidator.updateUserModel,
				headers: UserValidator.jwtValidator
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'Updated info.',
						},
						'401': {
							'description': 'User does not have authorization.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'POST',
		path: '/api/users',
		config: {
			handler: userController.createUser,
			tags: ['api', 'users'],
			description: 'Create a user.',
			validate: {
				payload: UserValidator.createUserModel
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'201': {
							'description': 'User created.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'POST',
		path: '/api/users/login',
		config: {
			handler: userController.loginUser,
			tags: ['api', 'users'],
			description: 'Login a user.',
			validate: {
				payload: UserValidator.loginUserModel
			},
			plugins: {
				'hapi-swagger': {
					responses: {
						'200': {
							'description': 'User logged in.'
						}
					}
				}
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/api/auth/twitter',
		config: {
			tags: ['api', 'users'],
			auth: 'twitter',
			description: 'authenticate through twitter.',
			handler: userController.twitterRegister
		}
	});
}
