// external dependencies
var config = require('../config');
var path = require('path');
var extend = require('extend');
var ndarray = require('ndarray');
import { EventEmitter } from 'events';
import { VoxelServer } from './voxel-server';

import {ChunkStore} from './chunk-store';
import {MysqlChunkStore} from './chunk-stores/mysql';
import {FileChunkStore} from './chunk-stores/file';
import {ServerLandGenerator} from './generators/server-land';
//import {ServerTennisGenerator} from './generators/server-tennis';
//import {ServerPerlinGenerator} from './generators/server-perlin';
//import {ServerRegionsGenerator} from './generators/server-regions';
//import {ServerTerracedGenerator} from './generators/server-terraced';


// internal dependencies
//var modvox = require('./features/modvox/server.js');
//var entity = require('./features/entity/server.js');

var debug=false;
export class GameServer extends EventEmitter {
	baseServer: any;
	game: any;
	settings: any;
	spatialTriggers: any[];
	connections: number;
	connectionLimit: number = 10;
	chunkStore: any;
	generator: any;
	pendingChunks :any =  {};

	constructor(opts: any) {
		super();
		this.initialize(opts);
	}

	private initialize(opts: any) {
		var self = this;

		// for debugging
		var defaults = {
			generateChunks: false,
			//arrayType: Uint8Array,//.BYTES_PER_ELEMENT,// Uint16Array,  // arrayType: Uint8Array
			/*
			generateChunks: false,
			generate : function(){
				//used in  return voxel.generate(low, high, self.generate, self)
			},
			generateVoxelChunk : function(){
				//voxel.generate : used in chunker::generateVoxelChunk(bounds[0], bounds[1], x, y, z)
			},*/
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
				'logoak',
				'leavesOak',
			],
			avatarInitialPosition: [0, 20, 0],
			forwardEvents: [
				'spatialTrigger',
				'missingChunk',
				'renderChunk'
			],
		};
		var settings = self.settings = extend({}, defaults, opts);

		/*if ( config.mysql) {
			let mysqlPool = require('mysql').createPool(config.mysql);
			this.chunkStore = new MysqlChunkStore(
				new ServerTerracedGenerator(config.chunkSize),
				config.mysql
			);
		} else {
		}*/

		// get database
		// enable event forwarding for features
		//settings.forwardEvents.push('modvox');
		//settings.forwardEvents.push('entity');

		// create and initialize base game server
		var baseServer = self.baseServer = new VoxelServer(settings);
		self.game = baseServer.game;

		this.chunkStore = new FileChunkStore(
			new ServerLandGenerator(config.chunkSize,baseServer),
			//new ServerRegionsGenerator(config.chunkSize),
			'./tmp/'//config.chunkFolder
		);

		// sane defaults
		self.spatialTriggers = [];
		// expose emitter methods on client
		// add features
		//modvox(self);
		//entity(self);
		self.bindEvents();

	}

	public connectClient(duplexStream: any) {
		var self = this;
		self.baseServer.connectClient(duplexStream);
		console.log('connectClient', duplexStream.id);
	}

	public removeClient(duplexStream: any) {
		var self = this;
		self.baseServer.removeClient(duplexStream);
		console.log('removeClient',duplexStream.id);
	}

	private bindEvents() {
		var self = this;
		var settings = self.settings;
		var baseServer = self.baseServer;
		var game = self.game;

		// setup spatial triggers
		self.setupSpatialTriggers();

		// setup world CRUD handlers
		baseServer.on('missingChunk', function (position: any, complete: any) {
			let chunkId = position.join('|');
			if (debug) {
				console.log('game-server:missingChunk',chunkId);
			}
			if(chunkId in self.pendingChunks){
				//return ;
			}
			self.pendingChunks[chunkId]=1;
			self.chunkStore.get(chunkId);
		});

		self.chunkStore.emitter.on('got',function(chunk:any){
			let chunkId = chunk.position.join('|');
			//console.log('game-server:missingChunk todo',chunkId);
			var dimensions: any[] = [self.game.chunkSize,self.game.chunkSize,self.game.chunkSize];

			var _chunk: any = {
				position : chunk.position,
				//voxels: self.getFlatChunkVoxels(position),
				voxels: chunk.voxels,
				dims : dimensions,
				length : chunk.voxels.length
			};

			self.game.showChunk(_chunk);
			self.emit('chunkLoaded', _chunk);
		});

		baseServer.on('renderChunk', function(chunk: any) {
			let chunkId = chunk.position.join('|');
			if (debug) {
				console.log('renderChunk',chunkId);
			}
			Object.keys( baseServer.clients ).map( function( clientId ) {
				baseServer.sendChunk(baseServer.clients[clientId], chunkId);
			});
			if(chunkId in self.pendingChunks){
				delete(self.pendingChunks[chunkId]);
			}
		});


		baseServer.on('set', function(pos: any, val: any) {
			var chunk = game.getChunkAtPosition(pos);
			//storeChunk(chunk);
		});


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

	}

	private setupSpatialTriggers() {
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

	getFlatChunkVoxels(position: any) {
		var material = 11;
		if (position[1] > 0) {
			material = 0;
		}

		var chunkSize = 32;
		var width = chunkSize;
		var pad = 4;
		var arrayType = Uint8Array;
		var chunkSizem = width - 1;

		var buffer = new ArrayBuffer((width + pad) * (width + pad) * (width + pad) * arrayType.BYTES_PER_ELEMENT);
		var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
		var h = pad >> 1;
		var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);
		var b = 0;
		for (var x = 0; x < width; ++x) {
			for (var z = 0; z < width; ++z) {
				for (var y = 0; y < width; ++y) {
					b++;
					if ((x == 0 || x == chunkSizem || z == 0 || z == chunkSizem) && (y == 0 || y == chunkSizem)) {
						voxels.set(x, y, z, 37);
					} else if (position[1] == 0 && y == 0) {
						voxels.set(x, y, z, material);
					} else {
						voxels.set(x, y, z, 0);
					}
				}
			}
		}
		voxelsPadded.position = position;
		return voxelsPadded;
	}
}
