import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Path from 'Path';
import * as Wreck from 'wreck';
import * as Tasks from "./games";
import * as Users from "./users";
import * as socket from './socket';
import {IDatabase} from "./database";
import {IPlugin} from "./plugins/interfaces";
import {IServerConfigurations} from "./configurations";
import {GameServer} from '../gameServer/game-server';

export function init(configs: IServerConfigurations, database: IDatabase): Promise<Hapi.Server> {

	return new Promise<Hapi.Server>(resolve => {

		const port = process.env.PORT || configs.port;
		const server = new Hapi.Server();
		const gameserver = new GameServer();
		server.connection({
			port: port,
			routes: {
				cors: true
			}
		});

		if (configs.routePrefix) {
			server.realm.modifiers.route.prefix = configs.routePrefix;
		}

		const plugins: Array<string> = configs.plugins;
		const pluginOptions = {
			database: database,
			serverConfigs: configs
		};

		let pluginPromises = [];

		plugins.forEach((pluginName: string) => {
			var plugin: IPlugin = (require("./plugins/" + pluginName)).default();
			console.log(`Register Plugin ${plugin.info().name} v${plugin.info().version}`);
			pluginPromises.push(plugin.register(server, pluginOptions));
		});

		Promise.all(pluginPromises).then(() => {
			console.log('All plugins registered successfully.');

			console.log('Register Routes');
			Tasks.init(server, configs, database);
			Users.init(server, configs, database);

			console.log('Routes registered sucessfully.');

			resolve(server);
		}).then(() => {
			socket.register(server, configs, {});
			server.register([require('inert')], (err) => {
				let path = process.cwd() + '/public/';
				console.log('Static serving at ' + path);
				server.route({
					method: 'GET',
					path: '/{param*}',
					handler: {
						directory: {
							path: path
						}
					}
				});
			});
			resolve(server);
		}).then(() => {
			server.ext('onPreResponse', function(request, reply) {
				if (request.route.path.match(/^\/api\/auth/) &&
					request.response.statusCode === 302 &&
					request.auth.credentials === null) {
					console.log(request.response);
					return reply(request.generateResponse({
						success: true,
						redirect: request.response.headers.location
					}));
				}
				return reply.continue();
			});
			resolve(server);
		});

	});
}
