import * as Server from "./server";
import * as Database from "./database";
import * as Configs from "./configurations";

console.log(`Running enviroment ${process.env.NODE_ENV || "dev"}`);

process.on('uncaughtException', (error: Error) => {
	console.error(`uncaughtException ${error.message}`);
});

process.on('unhandledRejection', (reason: any) => {
	console.error(`unhandledRejection ${reason}`);
});

const dbConfigs = Configs.getDatabaseConfig();
const database = Database.init(dbConfigs);

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs, database).then((server) => {
	server.start(() => {
		console.log('Server running at:', server.info.uri);
	});
});
