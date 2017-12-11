// external dependencies
var config = require('../config');
var path = require('path');
var extend = require('extend');
//var ndarray = require('ndarray');
import {EventEmitter} from 'events';
import {WebSocketStream} from 'websocket-stream';
import {voxelServer} from './voxel-server';
// internal dependencies
//var modvox = require('./features/modvox/server.js');
//var entity = require('./features/entity/server.js');


export class GameServer extends EventEmitter {
	baseServer: any;
	game: any;
	settings: any;
	spatialTriggers: any[];
	connections: number;
	connectionLimit: number = 10;
	voxelDb: any;
	constructor(opts: any) {
		super();
		// force instantiation via `new` keyword
		this.initialize(opts);
	}

	connectClient(duplexStream: any) {
		var self = this;
		self.baseServer.connectClient(duplexStream);
		console.log(duplexStream.id, 'join');
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
		//self.voxelDb = settings.voxelDb;
		// remove db from settings hash so we dont send it over the connection
		//delete settings.voxelDb;

		// enable event forwarding for features
		//settings.forwardEvents.push('modvox');
		//settings.forwardEvents.push('entity');

		// create and initialize base game server
		var baseServer = self.baseServer = new voxelServer(settings);
		self.game = baseServer.game;

		// sane defaults
		self.spatialTriggers = [];
		// expose emitter methods on client
		// add features
		//modvox(self);
		//entity(self);
		self.bindEvents();
	}

	bindEvents() {
		var self = this;
		var settings = self.settings;
		var baseServer = self.baseServer;
		var game = self.game;

		// setup spatial triggers
		self.setupSpatialTriggers();

		// setup world CRUD handlers
		baseServer.on('missingChunk', function (position: any, complete: any) {
			var game = self.game;
			var cs = game.chunkSize;
			var dimensions: any[] = [cs, cs, cs];

			var chunk: any = {
				position : position,
				voxels: self.baseServer.getFlatChunkVoxels(position), //new Uint8Array(chunk.voxels.buffer),
				dims : dimensions,
			};
			chunk.length=chunk.voxels.length;
			game.showChunk(chunk);
			console.log('dimensions', dimensions);
			// report this chunk load as complete
			self.emit('chunkLoaded', chunk);
		});

		baseServer.on('set', function(pos: any, val: any) {
			var chunk = game.getChunkAtPosition(pos);
			//storeChunk(chunk);
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
		baseServer.on('chat', function(message: any) {
			console.log('chat - ', message);
		});

		// handle errors
		baseServer.on('error', function(error: any) {
			console.log('error - error caught in server:');
			console.log(error.stack);
		});

		// store chunk in db
		/*function storeChunk(chunk: any) {
			self.voxelDb.store(settings.worldId, chunk, function afterStore(err: any) {
				if (err) {
					console.error('chunk store error', err.stack);
				}
			});
		}*/
	}

	getFlatChunkVoxelsaaaaaa(position: any) {
		console.log('missingChunk generation', position);

		if (position[1] > 0) {
			return 0;
		} // everything above y=0 is air

		var chunkSize = 32;
		var width = 32;
		var pad = 2;
		var arrayType = Uint16Array;

		var buffer = new ArrayBuffer((width) * (width) * (width) * arrayType.BYTES_PER_ELEMENT);
		var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
		var h = pad >> 1;
		var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);

		for (var x = 0; x < chunkSize; ++x) {
			for (var z = 0; z < chunkSize; ++z) {
				for (var y = 0; y < chunkSize; ++y) {
					voxels.set(x, y, z, 1);
				}
			}
		}

		return voxelsPadded;
	}

	setupSpatialTriggers() {
		var self = this;
		var baseServer = self.baseServer;

		// get modvoxes from db
		/*self.voxelDb.db.get('spatialTriggers', function(err: any, val: any) {
			self.spatialTriggers = val ? JSON.parse(val) : [];
		});*/

		// set modvox
		baseServer.on('spatialTrigger', function(spatialTrigger: any) {
			// add to list
			self.spatialTriggers.push(spatialTrigger);
			updateSpatialTriggerStore();
		});
		// send spatialTriggers on join
		baseServer.on('client.join', function(client: any) {
			console.log('client.join');
			self.spatialTriggers.map(function(spatialTrigger: any) {
				client.connection.emit('spatialTrigger', spatialTrigger);
			});
		});
		// store spatialTriggers
		function updateSpatialTriggerStore() {
			//self.voxelDb.db.put('spatialTriggers', JSON.stringify(self.spatialTriggers));
		}
	}
}
