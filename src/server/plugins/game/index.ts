import {IPlugin, IPluginOptions} from "../interfaces";
import * as Hapi from "hapi";
import * as Boom from "boom";
import {GameServer} from '../../../gameServer/game-server';
import { Server as WebSocketEmitterServer } from '../../../shared/web-socket-emitter';

export default (): IPlugin => {
	return {
		register: (server: Hapi.Server, options: IPluginOptions): Promise<void> => {
			return new Promise<void>((resolve) => {
				setTimeout(function(){
					console.log( 'Plugin Voxel game server started' );
					const gameServer = new GameServer({});
					//if(exposeGlobal){
					//	global.gameServer = gameServer;
					//}
					var wseServer = new WebSocketEmitterServer( {
						server: options.serverConfigs.game.address,
						port: options.serverConfigs.game.port
					} );

					wseServer.on( 'error', function( error: any ) {
						console.log( error );
					} );

					wseServer.on( 'connection', function( connection: any ) {
						console.log( 'Connected' );
						gameServer.connectClient( connection );
						connection.on( 'close', function() {
							console.log( 'main connection closed' );
							gameServer.removeClient( connection );
						} );
						connection.on( 'error', function() {
							console.log( 'main connection error' );
							gameServer.removeClient( connection );
						} );
					} );
					resolve();
				},300)
			});
		},
		info: () => {
			return {
				name: "Voxel Game",
				version: "1.0.0"
			};
		}
	};
};
