import {IPlugin, IPluginOptions} from "../interfaces";
import * as Hapi from "hapi";
import * as Boom from "boom";
import {GameServer} from '../../../gameServer/game-server';
import { Server as WebSocketEmitterServer } from '../../../shared/web-socket-emitter';

export default (): IPlugin => {
	return {
		register: (server: Hapi.Server, options: IPluginOptions): Promise<void> => {
			const gameServer = new GameServer({
			});

			return new Promise<void>((resolve) => {
				console.log( 'started' );
				var wseServer = new WebSocketEmitterServer( {
					server: '127.0.0.1',
					port: options.serverConfigs.game.port
				} );

				wseServer.on( 'error', function( error: any ) {
					console.log( error );
				} );

				wseServer.on( 'connection', function( connection: any ) {
					console.log( 'connected' );
					gameServer.connectClient( connection );
					connection.on( 'close', function() {
						console.log( 'main connection closed' );
						gameServer.removeClient( connection );
					} );
					connection.on( 'error', function() {
						console.log( 'main connection error' );
						gameServer.removeClient( connection );
					} );
					resolve();
				} );
			});
		},
		info: () => {
			return {
				name: "Voxel game server",
				version: "1.0.0"
			};
		}
	};
};
