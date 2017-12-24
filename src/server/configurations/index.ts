import * as nconf from "nconf";
import * as path from "path";

const configurationFilename = path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`);
nconf.env({
	separator: '__',
	match: /^.*__.*/
})
.argv()
.file({
	file: configurationFilename
});
console.log('Configuration Filename ',configurationFilename)
console.log('nconf',nconf);

export interface IServerConfigurations {
	port: number;
	plugins: Array<string>;
	routePrefix: string;
	jwt: IJWTConfiguration;
	social: ISocialDatasConfiguration;
	game: IGameConfigurations;
}

export interface IDataConfiguration {
	connectionString: string;
}

export interface IJWTConfiguration {
	jwtSecret: string;
	jwtExpiration: string;
}
export interface ISocialDataConfiguration {
	id : string;
	secret : string;
}

export interface ISocialDatasConfiguration {
	twitter : ISocialDataConfiguration;
}

export interface IGameConfigurations {
	port: number;
	address : string;
	generator: string;
}

export function getDatabaseConfig(): IDataConfiguration {
	return nconf.get("database");
}

export function getServerConfigs(): IServerConfigurations {
	return nconf.get("server");
}

export function getGameConfigs(): IGameConfigurations {
	return nconf.get("server").game;
}

console.log('- - - - - - - -');
console.log('Env : ', process.env.NODE_ENV);
console.log("Full config : ", nconf.get(null));
console.log('- - - - - - - -');
console.log('Database : ', getDatabaseConfig());
console.log('Server : ', getServerConfigs());
console.log('Game : ', getGameConfigs());
console.log('- - - - - - - -');
