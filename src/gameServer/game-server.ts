var WebSocketEmitter = require('../shared/web-socket-emitter');
import {Server} from './lib/server';
import {FileChunkStore} from './lib/chunk-stores/file';
import {MysqlChunkStore} from './lib/chunk-stores/mysql';
var chunkGenerator = require('../shared/generators/server-terraced');
import {VoxelStats} from './lib/voxel-stats';
var config = require('../../../config');
var debug = false;

export class GameServer {
	mysqlPool: any;
	clientSettings: {
		initialPosition: any;
	};

	constructor() {
		// This only gets filled by require if config.mysql isn't empty
		this.clientSettings = {
			initialPosition: config.initialPosition
		};

		var chunkStore = null;
		if (config.mysql) {
			this.mysqlPool = require('mysql').createPool(config.mysql);
			chunkStore = new MysqlChunkStore(
				new chunkGenerator(config.chunkSize),
				config.mysql
			);
		} else {
			chunkStore = new FileChunkStore(
				new chunkGenerator(config.chunkSize),
				config.chunkFolder
			);
		}

		var serverSettings = {
			// test with memory chunk store for now
			worldRadius: config.worldRadius || 10,
			maxPlayers: config.maxPlayers || 10
		};

		// Chunk persistence
		var chunksToSave = {};

		var server = new Server(config, chunkStore, serverSettings, this.clientSettings);

		server.on('client.join', function(client: any) {
			console.log(client);
		});

		server.on('client.leave', function(client: any) {
		});

		server.on('client.state', function(state: any) {
		});

		server.on('chat', function(message: any) {
			console.log('chat', message);
			VoxelStats.count('chat.messages.sent');
			if (this.mysqlPool) {
				var row = {
					created_ms: Date.now(),
					username: message.user,
					message: message.text
				};
				this.mysqlPool.query('insert into chat SET ?', row);
			}
		});

		server.on('error', function(error: any) {
			console.log(error);
		});

		function clientUsernames() {
			var usernames = [];
			for (var clientId in server.clients) {
				var client = server.clients[clientId];
				usernames.push(client.username);
			}
			console.log('Usernames:', usernames.join(','));
		}

		// WEBSOCKET SETUP
		var connectionLimit = config.maxPlayers;
		var connections = 0;

		var wseServer = new WebSocketEmitter.server({
			host: config.websocketBindAddress,
			port: config.websocketBindPort
		});

		wseServer.on('error', function(error: any) {
			console.log(error);
		});

		wseServer.on('connection', function(connection: any) {
			VoxelStats.count('connections.incoming');
			// Have we reached our player max?
			var ts = new Date();
			console.log(ts.toUTCString(), 'Incoming client connection');
			connections++;
			console.log('Connections: ' + connections);

			connection.on('close', function() {
				connections--;
				var ts = new Date();
				console.log(ts.toUTCString(), 'Connections: ' + connections);
			});
			if (connections > connectionLimit) {
				console.log('Denying connection, at our limit');
				connection.close();
				return;
			}
			server.connectClient(connection);
		});
	}
}
