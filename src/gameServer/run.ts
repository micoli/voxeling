import { GameServer } from './game-server';
const Path = require( 'path' );
const Hapi = require( 'hapi' );
const Inert = require( 'inert' );
import { Server as WebSocketEmitterServer } from '../shared/web-socket-emitter';

var run = function() {
	var worldId = 'test';

	var serverPort = 5000;


	var gameServer = new GameServer( {
		worldId: worldId
	} );

	const httpServer = new Hapi.Server();
	httpServer.connection( {
		port: serverPort,
		routes: {
			cors: true,
			files: {
				relativeTo: Path.join( __dirname, '../../../public' )
			}
		}
	} );

	const provision = async () => {
		await httpServer.register( Inert );
		await httpServer.start();
		httpServer.route( {
			method: 'GET',
			path: '/{param*}',
			handler: {
				directory: {
					path: '.',
					redirectToSlash: true,
					index: true,
				}
			}
		} );
		console.log( 'Server running at:', httpServer.info.uri, Path.join( __dirname, '../../../public' ) );
	}
	provision();

	setTimeout( function() {
		console.log( 'started' );
		var wseServer = new WebSocketEmitterServer( {
			server: '127.0.0.1',
			port: 10005
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
		} );
	}, 3000 );


};

run();
