import * as Hapi from "hapi";
import * as Boom from "boom";
//import * as Path from 'Path';
import * as Wreck from 'wreck';
import * as Tasks from "./games";
import * as Users from "./users";
import * as socket from './socket';
import {IDatabase} from "./database";
import {IPlugin} from "./plugins/interfaces";
import {IServerConfigurations} from "./configurations";

export function init(configs: IServerConfigurations, database: IDatabase): Promise<Hapi.Server> {

	return new Promise<Hapi.Server>(resolve => {

		const port = process.env.PORT || configs.port;
		const server = new Hapi.Server();

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
			serverConfigs: configs,
		};

		console.log('Registering Plugins');
		let pluginPromises:any[] = [];
		plugins.forEach((pluginName: string) => {
			var plugin: IPlugin = (require("./plugins/" + pluginName)).default();
			console.log(` - Plugin ${plugin.info().name} v${plugin.info().version}`);
			pluginPromises.push(plugin.register(server, pluginOptions));
		});

		Promise
		.all(pluginPromises)
		.then(() => {
			return new Promise(function (presolve:any, reject:any) {
				console.log('Plugins registered successfully.');

				console.log('Registering Routes');
				Tasks.init(server, configs, database);
				Users.init(server, configs, database);
				console.log('Routes registered sucessfully.');

				presolve();
			});
		}).then(() => {
			return new Promise(function (presolve:any, reject:any) {
				console.log('Registering Static content');
				//socket.register(server, configs, {});
				server.register([require('inert')], (err) => {
					let path = process.cwd() + '/public/';
					console.log('Static content served at ' + path);
					server.route({
						method: 'GET',
						path: '/{param*}',
						handler: {
							directory: {
								path: path
							}
						}
					});
					console.log('Static content registered');
					presolve();
				});
			});
		}).then(() => {
			return new Promise(function (presolve:any, reject:any) {
				console.log('Registering Authentication interceptor');
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
				console.log('Authentication interceptor registered');
				presolve();
			});
		}).then(() => {
			console.log('Initialization Done.');
			resolve(server);
		});
	});
}
