


// external dependencies
var config = require('../config');
var path = require('path');
var extend = require('extend');
import {EventEmitter} from 'events';
// voxel depenencies
var voxelServer = require('voxel-server');
// internal dependencies
//var modvox = require('./features/modvox/server.js');
//var entity = require('./features/entity/server.js');
var WebSocketEmitter = require('../shared/web-socket-emitter');


export class GameServer extends EventEmitter {
	baseServer : any;
	game:any;
	settings:any;
	spatialTriggers:any [];
	connections:number;
	connectionLimit:number=10;
	constructor(opts: any) {
		super();
		// force instantiation via `new` keyword
		this.initialize(opts);
	}

	connectClient(duplexStream: any) {
		var self = this;
		self.baseServer.connectClient(duplexStream);
		console.log(duplexStream.id, 'joined');
	}

	removeClient(duplexStream: any) {
		var self = this;
		self.baseServer.removeClient(duplexStream);
		console.log(duplexStream.id, 'left');
	}

	//
	// Private
	//

	initialize(opts: any) {
		var self = this;

		// for debugging
		var defaults = {
			generateChunks: false,
			chunkDistance: 2,
			materials: [
				['grass', 'dirt', 'grass_dirt'],
				'dirt',
				'plank',
				'cobblestone',
				'brick',
				'bedrock',
				'glowstone',
				'netherrack',
				'obsidian',
				'diamond',
				'whitewool',
				'redwool',
				'bluewool',
			],
			avatarInitialPosition: [2, 20, 2],
			forwardEvents: ['spatialTrigger'],
		};
		var settings = self.settings = extend({}, defaults, opts);

		// get database
		self.voxelDb = settings.voxelDb;
		// remove db from settings hash so we dont send it over the connection
		delete settings.voxelDb;

		// enable event forwarding for features
		//settings.forwardEvents.push('modvox');
		//settings.forwardEvents.push('entity');

		// create and initialize base game server
		var baseServer = self.baseServer = voxelServer(settings);
		self.game = baseServer.game;

		// sane defaults
		self.spatialTriggers = [];

		// expose emitter methods on client

		// add features
		//modvox(self);
		//entity(self);
		//this.initWSServer();
		self.bindEvents();
	}

	initWSServer() {
		var self = this;
		var wseServer = new WebSocketEmitter.server({
			host: config.websocketBindAddress,
			port: config.websocketBindPort
		});

		wseServer.on('error', function(error: any) {
			console.log(error);
		});

		wseServer.on('connection', function(connection: any) {
			//VoxelStats.count('connections.incoming');
			// Have we reached our player max?
			var ts = new Date();
			console.log(ts.toUTCString(), 'Incoming client connection');
			self.connections++;
			console.log('Connections: ' + self.connections);

			connection.on('close', function() {
				self.connections--;
				var ts = new Date();
				console.log(ts.toUTCString(), 'Connections: ' + self.connections);
			});
			if (self.connections > self.connectionLimit) {
				console.log('Denying connection, at our limit');
				connection.close();
				return;
			}
			self.connectClient(connection, 'a' + self.connections);
		});
		console.log('initWSServer');
	}

	bindEvents() {
		var self = this;
		var settings = self.settings;
		var baseServer = self.baseServer;
		var game = self.game;

		// setup spatial triggers
		self.setupSpatialTriggers();

		// setup world CRUD handlers
		baseServer.on('missingChunk', loadChunk);
		baseServer.on('set', function(pos: any, val: any) {
			var chunk = game.getChunkAtPosition(pos);
			storeChunk(chunk);
		});
		// trigger world load and emit 'ready' when done

		var loadedChunks = 0;
		var expectedNumberOfInitialChunks = Math.pow(self.game.voxels.distance * 2, 3); // (2*2)^3=64 from [-2,-2,-2] --> [1,1,1]
		self.on('chunkLoaded', function(chunk: any) {
			loadedChunks++;
			// TODO: ideally would unsub if this condition is true
			if (loadedChunks === expectedNumberOfInitialChunks) {
				self.emit('ready');
			}
		});
		game.voxels.requestMissingChunks(game.worldOrigin);

		// log chat
		baseServer.on('chat', function(message:any) {
			console.log('chat - ', message);
		});

		// handle errors
		baseServer.on('error', function(error:any) {
			console.log('error - error caught in server:');
			console.log(error.stack);
		});

		// store chunk in db
		function storeChunk(chunk: any) {
			self.voxelDb.store(settings.worldId, chunk, function afterStore(err:any) {
				if (err) {
					console.error('chunk store error', err.stack);
				}
			});
		}

		// load chunk from db
		function loadChunk(position: any, complete: any) {
			var game = self.game;
			var cs = game.chunkSize;
		var dimensions:any[] = [cs, cs, cs];
			self.voxelDb.load(settings.worldId, position, dimensions, function(err: any, chunk: any) {
				if (err) {
					return console.error(err.stack);
				}
				var chunk:any = {
					position: position,
					voxels: new Uint8Array(chunk.voxels.buffer),
					dims: chunk.dimensions
				};
				game.showChunk(chunk);
				// report this chunk load as complete
				self.emit('chunkLoaded', chunk);
			});
		}

	}

	setupSpatialTriggers() {
		var self = this;
		var baseServer = self.baseServer;

		// get modvoxes from db
		self.voxelDb.db.get('spatialTriggers', function(err: any, val: any) {
			self.spatialTriggers = val ? JSON.parse(val) : [];
		});

		// set modvox
		baseServer.on('spatialTrigger', function(spatialTrigger: any) {
			// add to list
			self.spatialTriggers.push(spatialTrigger);
			updateSpatialTriggerStore();
		});
		// send spatialTriggers on join
		baseServer.on('client.join', function(client: any) {
			self.spatialTriggers.map(function(spatialTrigger: any) {
				client.connection.emit('spatialTrigger', spatialTrigger);
			});
		});
		// store spatialTriggers
		function updateSpatialTriggerStore() {
			self.voxelDb.db.put('spatialTriggers', JSON.stringify(self.spatialTriggers));
		}
	}
}
