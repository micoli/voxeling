import {IPlugin, IPluginOptions} from "../interfaces";
import * as Hapi from "hapi";
import {IUser, UserModel} from "../../users/user";
import * as Boom from "boom";

export default (): IPlugin => {
	return {
		register: (server: Hapi.Server, options: IPluginOptions): Promise<void> => {
			const database = options.database;
			const serverConfig = options.serverConfigs;

			const validateUser = (decoded: any, request: any, cb: any) => {
				database.userModel.findById(decoded.id).lean(true)
					.then((user: IUser) => {
						if (!user) {
							return cb(null, false);
						}

						return cb(null, true);
					});
			};

			return new Promise<void>((resolve) => {
				server.register({
					register: require('bell')
				}, (error) => {
					if (error) {
						console.log(`Error registering bell plugin: ${error}`);
					} else {
						server.auth.strategy('twitter', 'bell', {
							provider: 'twitter',
							password: 'cookie_encryption_password_secure',
							isSecure: false,
							clientId: serverConfig.social.twitter.id,
							clientSecret: serverConfig.social.twitter.secret
						});
					}
					resolve();
				});
			});
		},
		info: () => {
			return {
				name: "bell Authentication",
				version: "1.0.0"
			};
		}
	};
};
