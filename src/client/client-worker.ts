var config = require('../config');

import {Coordinates} from '../shared/coordinates';
import {Textures} from './lib/textures';
import {Frustum} from './lib/frustum';
import {ClientGenerator} from '../shared/generators/client';
var WebSocketEmitter = require('../shared/web-socket-emitter');
var decoder = require('./lib/rle-decoder');
var pool = require('./lib/object-pool');
var mesher = require('./lib/meshers/horizontal-merge');
var timer = require('./lib/timer');
var log = require('../shared/log')('client-worker');

var chunkArrayLength = config.chunkSize * config.chunkSize * config.chunkSize;
var chunkCache:any = {};
var debug = true;

/*
INCOMING WEBWORKER MESSAGES

connect - client wants us to connect to the websocket server


OUTGOING WEBWORKER MESSAGES

open - websocket connection opened

close - websocket connection closed

chunk - sending a decoded, meshed chunk to the client

*/

interface IWorker {
	coordinates: any;
	connected: boolean;
	connection: any;
	frustum: any;
	// When we get chunks from the server, we queue them here
	chunksToDecodeAndMesh: any;
	// When we get chunks from server, or when user changed a voxel, we need to remesh. Queue them here
	chunksToMesh: any;
	// When we get chunks from server and need to send voxel data to client, they're queued here
	voxelsToSend: any;
	// Chunk ids (and meshes) in the order we want them
	chunkPriority: any[];
	// Meshes we've recently sent
	meshesSent: any;
	// Chunk ids we want voxels for
	voxels: any[];
	currentVoxels: any;
	// Chunks we're in the process of requesting from the server
	neededChunks: any;
}


var worker:any = {
	coordinates: null,
	connected: false,
	connection: null,
	frustum: null,
	// When we get chunks from the server, we queue them here
	chunksToDecodeAndMesh: {},
	// When we get chunks from server, or when user changed a voxel, we need to remesh. Queue them here
	chunksToMesh: {},
	// When we get chunks from server and need to send voxel data to client, they're queued here
	voxelsToSend: {},
	// Chunk ids (and meshes) in the order we want them
	chunkPriority: [],
	// Meshes we've recently sent
	meshesSent: {},
	// Chunk ids we want voxels for
	voxels: [],
	currentVoxels: {},
	// Chunks we're in the process of requesting from the server
	neededChunks: {},

	createFrustum: function(verticalFieldOfView: any, ratio: any, farDistance: any) {
		this.frustum = new Frustum(verticalFieldOfView, ratio, 0.1, farDistance);
	},

	emit: function(name: any, data: any) {
		var len = arguments.length;
		var args = new Array(len);
		for (var i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		postMessage(args);
	},


	connect: function() {
		var self = this;
		var coordinates = this.coordinates = new Coordinates(config.chunkSize);
		var textures = new Textures(config.textures);
		var websocket = this.connection = new WebSocketEmitter.client();
		var generator = new ClientGenerator(chunkCache, config.chunkSize);

		mesher.config(config.chunkSize, textures, coordinates, chunkCache);

		websocket.on('open', function() {
			self.connected = true;
			if (debug) {
				log('websocket connection opened');
			}
			self.emit('open');
		});

		websocket.on('close', function() {
			self.connected = false;
			if (debug) {
				log('websocket connection closed');
			}
			self.emit('close');
		});

		websocket.on('error', function(message: any) {
			log('websocket error, ' + message);
		});

		websocket.on('settings', function(settings: any, id: any) {
			if (debug) {
				log('got settings', settings);
			}
			self.emit('settings', settings, id);
		});

		websocket.on('chunk', function(chunkID: any, encoded: any) {
			if (debug) {
				log('Websocket received chunk: ' + chunkID);
			}
			var index = self.chunkPriority.indexOf(chunkID);
			if (index === -1) {
				if (debug) {
					log('Got chunk, but we dont care about it', chunkID, self.chunkPriority);
				}
				return;
			}
			self.chunksToDecodeAndMesh[chunkID] = encoded;

			// Cleanup
			if (chunkID in self.neededChunks) {
				delete self.neededChunks[chunkID];
			}

		});

		// fires when server sends us voxel edits [chunkID, voxelIndex, value, voxelIndex, value...]
		websocket.on('chunkVoxelIndexValue', function(changes: any) {
			// Tell the client
			self.emit('chunkVoxelIndexValue', changes);
			// Update our local cache
			for (var chunkID in changes) {
				if (self.chunkPriority.indexOf(chunkID) === -1) {
					continue;
				}
				if (chunkID in chunkCache) {
					var chunk = chunkCache[chunkID];
					var details = changes[chunkID];
					for (var i = 0; i < details.length; i += 2) {
						var index = details[i];
						var val = details[i + 1];
						chunk.voxels[index] = val;
					}
					// Re-mesh this chunk
					self.chunksToMesh[chunkID] = true;
					if (self.voxels.indexOf(chunkID) > -1) {
						self.voxelsToSend[chunkID] = true;
					}
				}
			}
		});

		websocket.on('chat', function(message: any) {
			self.emit('chat', message);
		});

		websocket.on('players', function(players: any) {
			self.emit('players', players);
		});

		this.connection.connect(config.server);
	},

	regionChange: function(playerPosition: any, rotationQuat: any, drawDistance: any, removeDistance: any) {
		var self = this;

		// TODO update the frustum
		log('regionChange: playerPosition is', playerPosition);
		this.frustum.update(playerPosition, rotationQuat, drawDistance);


		// These help us remove voxels and meshes we no longer need
		var nearbyVoxels:any = {};
		// We tell our web worker about these, so it knows what to fetch and return
		var onlyTheseVoxels: any[] = [];
		var missingVoxels: any[] = [];
		var i: number;

		// Helps us ignore chunks we don't care about, and also prioritize re-drawing nearby chunks
		var chunkDistances:any = {};
		var len = drawDistance * 3;
		var priority = new Array(len);
		for (i = 0; i < len; i++) {
			priority[i] = [];
		}
		var addPriority = function(level: any, chunkID: any) {
			log('regionChange.addPriority: level', level);
			priority[level].push(chunkID);
		};

		// Hmm, I seem to have removed the removeDistance logic. do we still want that 1 chunk buffer zone?

		this.coordinates.nearbyChunkIDsEach(
			playerPosition,
			removeDistance,
			function(chunkID: any, chunkPosition: any, distanceAway: any) {
				// We only care about voxel data for the current chunk, and the ring around us
				if (distanceAway < 3) {
					nearbyVoxels[chunkID] = 0;
					onlyTheseVoxels.push(chunkID);
					if (!(chunkID in self.currentVoxels)) {
						missingVoxels.push(chunkID);
					}
				}
				// We only care about meshes up to our draw distance
				/*
				if (distanceAway <= self.removeDistance) {
					nearbyMeshes[chunkID] = 0;
				}
				*/

				// Set fetch priority
				if (distanceAway < 2) {
					addPriority(distanceAway, chunkID);
					chunkDistances[chunkID] = distanceAway;
				} else if (distanceAway <= drawDistance) {
					// If outside frustum, add config.drawDistnace to distanceAway as priority
					// Use frustum to determine our fetch priority.
					// We want visible meshes to be fetched and drawn first
					if (self.frustum.chunkVisible(chunkID, chunkPosition)) {
						addPriority(distanceAway, chunkID);
					} else {
						addPriority(distanceAway + removeDistance, chunkID);
					}
					chunkDistances[chunkID] = distanceAway;
				} else if (distanceAway <= removeDistance) {

				}
			}
		);

		var prioritized: any[] = [];
		for (i = 0; i < priority.length; i++) {
			Array.prototype.push.apply(prioritized, priority[i]);
		}

		self.updateNeeds(prioritized, chunkDistances, onlyTheseVoxels, missingVoxels);
		postMessage(['meshesToShow', chunkDistances]);
		postMessage(['nearbyChunks', nearbyVoxels]);
		log('nearbyVoxels', nearbyVoxels);
	},


	// Client told us the order it wants to receive chunks in
	updateNeeds: function(chunkIds: any, chunkDistances: any, onlyTheseVoxels: any, missingVoxels: any) {
		var i, chunkId;
		// Prioritized list of meshes that we want
		this.chunkPriority = chunkIds;
		this.voxels = onlyTheseVoxels;

		// Tell server that we only care about these chunks
		this.connection.emit('onlyTheseChunks', chunkIds);

		// Might be easier to process these later
		for (i = 0; i < chunkIds.length; i++) {
			chunkId = chunkIds[i];

			// If we haven't recently sent this mesh to the client
			if (!(chunkId in this.meshesSent)) {
				if (chunkId in chunkCache) {
					this.chunksToMesh[chunkId] = true;
				} else if (!(chunkId in this.neededChunks)) {
					// Request this chunk from server if we haven't yet
					this.neededChunks[chunkId] = true;
				}
			}
			if (missingVoxels.indexOf(chunkId) > -1) {
				if (chunkId in chunkCache) {
					this.voxelsToSend[chunkId] = true;
				}
			}
		}

		// We keep track of which meshes we've sent to the client,
		// remove the ones we no longer care about
		for (chunkId in this.meshesSent) {
			if (!(chunkId in chunkDistances)) {
				delete this.meshesSent[chunkId];
			}
		}

		// Ignore chunks we no longer care about
		var _chunkIds = Object.keys(this.neededChunks);
		for (i = 0; i < _chunkIds.length; i++) {
			chunkId = _chunkIds[i];
			if (this.chunkPriority.indexOf(chunkId) === -1) {
				delete this.neededChunks[chunkId];
			}
		}


	},

	/*
	We queue up chunks when we receive them from the server. This method decodes them and meshes them,
	in preparation for rendering.
	*/
	processChunks: function() {

		for (var chunkID in this.chunksToDecodeAndMesh) {
			// Skip if we're no longer interested in this chunk
			if (this.chunkPriority.indexOf(chunkID) === -1) {
				continue;
			}
			var encoded = this.chunksToDecodeAndMesh[chunkID];
			var position = chunkID.split('|').map(function(value) {
				return Number(value);
			});
			var data = pool.malloc('uint8', chunkArrayLength);

			var start = Date.now();
			var chunk = {
				chunkID: chunkID,
				position: position,
				voxels: decoder(encoded, data)
			};
			timer.log('rle-decode', Date.now() - start);
			// Cache in webworker
			// TODO: change this to an LRU cache
			chunkCache[chunkID] = chunk;

			if (this.voxels.indexOf(chunkID) > -1) {
				this.voxelsToSend[chunkID] = true;
			}
			this.chunksToMesh[chunkID] = true;
		}

		// Transfer voxel data to client
		let chunkIds = Object.keys(this.voxelsToSend);
		for (let i = 0; i < chunkIds.length; i++) {
			let chunkId = chunkIds[i];
			if (chunkId in chunkCache) {
				postMessage(['chunkVoxels', chunkCache[chunkId]]);
				delete this.voxelsToSend[chunkId];
			} else {
				//log('Error: attempted to send voxels that dont exist in chunkCache', chunkID)
			}
		}

		let _chunkIds = Object.keys(this.chunksToMesh);
		for (let i = 0; i < _chunkIds.length; i++) {
			let chunkId = _chunkIds[i];
			if (!(chunkId in chunkCache)) {
				// Need to error here
				log('Error: attempted to mesh a chunk not found in chunkCache', chunkID);
				continue;
			}

			let chunk = chunkCache[chunkId];
			var mesh = mesher.mesh(chunk.position, chunk.voxels);

			var transfer:any = {};
			var transferList = [];

			for (var textureValue in mesh) {
				var texture = mesh[textureValue];

				// We pass data.buffer, the underlying ArrayBuffer
				transfer[textureValue] = {
					position: {
						buffer: texture.position.data.buffer,
						offset: texture.position.offset,
						offsetBytes: texture.position.offset * 4,
						tuples: texture.position.offset / 3
					},
					texcoord: {
						buffer: texture.texcoord.data.buffer,
						offset: texture.texcoord.offset,
						offsetBytes: texture.texcoord.offset * 4
					},
					normal: {
						buffer: texture.normal.data.buffer,
						offset: texture.normal.offset,
						offsetBytes: texture.normal.offset * 4
					}
				};
				transferList.push(texture.position.data.buffer);
				transferList.push(texture.texcoord.data.buffer);
				transferList.push(texture.normal.data.buffer);
			}

			// specially list the ArrayBuffer object we want to transfer
			postMessage(['chunkMesh', chunkId, transfer, transferList]);
			delete this.chunksToMesh[chunkId];
			this.meshesSent[chunkId] = true;

			// Stop after sending 10 meshes, to make sure we send voxel data in a timely manner
			if (i > 9) {
				break;
			}
		}

		this.chunksToDecodeAndMesh = {};
	},

	// Update our local cache and tell the server
	chunkVoxelIndexValue: function(changes: any, touching: any) {
		var self = this;
		var chunkID;
		self.connection.emit('chunkVoxelIndexValue', changes);
		for (chunkID in changes) {
			if (chunkID in chunkCache) {
				var chunk = chunkCache[chunkID];
				var details = changes[chunkID];
				for (var i = 0; i < details.length; i += 2) {
					var index = details[i];
					var val = details[i + 1];
					chunk.voxels[index] = val;
				}
				// Re-mesh this chunk
				self.chunksToMesh[chunkID] = true;
			}
		}

		// Along with these voxel changes, there may be nearby chunks that we need to re-mesh
		// so we don't "see through the world"
		for (chunkID in touching) {
			if (chunkID in chunkCache) {
				self.chunksToMesh[chunkID] = true;
			}
		}
	},

	chat: function(message: any) {
		var self = this;
		self.connection.emit('chat', message);
	},

	/*
	Client no longer needs this mesh
	*/
	freeMesh: function(mesh: any) {
		for (var textureValue in mesh) {
			var textureMesh = mesh[textureValue];
			// We pass ArrayBuffers across worker boundary, so need to we-wrap in the appropriate type
			pool.free('float32', new Float32Array(textureMesh.position.buffer));
			pool.free('float32', new Float32Array(textureMesh.texcoord.buffer));
			pool.free('float32', new Float32Array(textureMesh.normal.buffer));
		}
	},
	/*
	Client no longer needs this chunk (voxels and mesh)
	Add the arrays back to the pool
	*/
	freeChunk: function(chunk: any) {
		var mesh = chunk.mesh;
		for (var textureValue in mesh) {
			var textureMesh = mesh[textureValue];
			textureMesh.position.free();
			textureMesh.texcoord.free();
			textureMesh.normal.free();
		}

		pool.free('uint8', chunk.voxels);
	},

	playerPosition(position: any, yaw: any, pitch: any, avatar: any) {
		if (!worker.connected) {
			return;
		}
		worker.connection.emit('myPosition', position, yaw, pitch, avatar);
	}
};

onmessage = function(e: any) {
	var message = e.data;
	var _type = message.shift();

	if (_type in worker) {
		worker[_type].apply(worker, message);
	} else {
		log('Worker does not have handler for ' + _type, message);
	}

};

var waitingOn = 0;
setInterval(
	function() {
		worker.processChunks();

		var ts = Date.now();
		var chunkIds = [];
		waitingOn = 0;
		// Request in the order the client wants them
		for (var i = 0; i < worker.chunkPriority.length; i++) {
			var chunkId = worker.chunkPriority[i];
			if (!(chunkId in worker.neededChunks)) {
				continue;
			}
			var lastRequested = worker.neededChunks[chunkId];
			if (ts > lastRequested) {
				if (debug) {
					log('Requesting ', chunkId);
				}
				chunkIds.push(chunkId);

				// Wait before requesting this chunk again
				worker.neededChunks[chunkId] = ts + 10000;
			}
			waitingOn++;


			// Only wait on 10 at a time
			if (waitingOn > 9) {
				break;
			}
		}

		if (chunkIds.length > 0) {
			worker.connection.emit('needChunks', chunkIds);
		}
	},
	// Ten times a second didn't seem fast enough
	1000 / 20
);

setInterval(
	function() {
		timer.print();
	},
	10000
);
