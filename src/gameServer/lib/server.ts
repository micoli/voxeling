var EventEmitter = require('events').EventEmitter;
var WebSocketEmitter = require('../../shared/web-socket-emitter');
var uuid = require('hat');

// voxel dependencies
var Coordinates = require('../../shared/coordinates');
var encoder = require('./rle-encoder');
var lru = require('./lru');
var debug = false;

function getRandomInt(min:number, max:number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export class Server {
	encodedChunkCache: any;
	clients: {};
	chunksForClients: {};
	coords: any;
	emitter: any;
	lastWorldChunks: number[];
	requestedChunks: {};
	clientSettings: any;
	serverSettings: any;
	chunkStore: any;
	config: any;

	constructor(config: any, chunkStore: any, serverSettings: any, clientSettings: any) {
		// force instantiation via `new` keyword
		//if(!(this instanceof Server)) { return new Server(serverSettings || {}, clientSettings || {}) }
		this.config = config;
		this.chunkStore = chunkStore;
		this.serverSettings = serverSettings;
		this.clientSettings = clientSettings;

		this.requestedChunks = {};

		var chunkSize = config.chunkSize;
		var origin = [0, 0, 0];
		var step = chunkSize * config.worldRadius;
		this.lastWorldChunks = [
			// Lower chunk
			origin[0] - step,
			origin[1] - step,
			origin[2] - step,

			// Farther chunk
			origin[0] + step,
			origin[1] + step,
			origin[2] + step
		];
		this.initialize();
	}


	public initialize() {
		var self = this;
		var clients = this.clients = {};
		this.emitter = new EventEmitter();
		this.coords = Coordinates(self.config.chunkSize);

		this.encodedChunkCache = new lru(10);

		// chunkId -> {clientIdA: true, clientIdB: true}
		this.chunksForClients = {};

		this.chunkStore.emitter.on('got', function(chunk: any) {
			if (debug) {
				console.log('got chunk ' + chunk.chunkID);
			}
			self.sendChunk(chunk);
		});

		// Prime our chunk store or LRU
		self.requestNearbyChunks(this.clientSettings.initialPosition);

		// send player position/rotation updates
		setInterval(function() {
			self.sendPlayers();
		}, 1000 / 3);

		// 3 updates per second
		// Send chunks every half-second
		/*
		setInterval(function() {
		var sendChunksBatchSize = 20;
		// Handle chunk generation
		for (var id in self.clients) {
		var client = self.clients[id];
		var ready = [];
		var chunkIDs;
		for (var chunkId in client.requestedChunks) {
		if (ready.length > sendChunksBatchSize) {
		break;
	}
	// Make sure chunkID is valid, not out of range, etc
	if (self.chunkStore.has(chunkID)) {
	ready.push(chunkID);
	delete client.requestedChunks[chunkID];
	}
	}
	if (ready.length > 0) {
	//console.log('Ready to send: ' + ready.length)
	self.sendChunks(client.connection, ready);
	}
	}
	}, 1e3 / 5);
	*/
	}


	// Setup the client connection - register events, etc
	public connectClient (wseSocket: any) {
		var self = this;
		var tnull: any = null;
		var id = wseSocket.id = uuid();
		var client = self.clients[id] = {
			id: id,
			// This gets updated when we get their position updates
			// Server should remove stale clients
			lastSeen: 0,
			connected: true,
			connection: wseSocket,
			avatar: 'player',
			position: tnull,
			yaw: 0,
			pitch: 0,

			requestedChunks: {},
			// The chunk ids this client cares about
			onlyTheseChunks: []
		};
		// setup client response handlers
		self.bindClientEvents(client);
		// send client id and initial game settings
		wseSocket.emit('settings', self.clientSettings, id);
	}

	public bindClientEvents (client: any) {
		var self = this;
		var id = client.id;
		var connection = client.connection;

		connection.on('error', function(message: any) {
			console.log('Client connection error: ' + message);
		});

		connection.on('end', function() {
			client.connected = false;
		});

		connection.on('close', function(error: any) {
			client.connected = false;
			delete self.clients[client.id];
		});

		// forward chat message
		connection.on('chat', function(message: any) {
			// ignore if no message provided
			if (!message.text) { return; }
			if (message.text.match(/script/i)) {
				console.log('Found script tag in message. Dropping');
				return;
			}
			// limit chat message length
			if (message.text.length > 255) { message.text = message.text.substr(0, 140); }
			self.broadcast(null, 'chat', message);
			self.emitter.emit('chat', message);
		});

		// when user ready ( game created, etc )
		connection.on('created', function() {
			// emit client.created for module consumers
			self.emitter.emit('client.created', client);
		});

		// client sends new position, rotation
		// don't need to lerp on the server AND the client, just the client
		connection.on('myPosition', function(position: any, yaw: any, pitch: any, avatar: any) {
			client.position = position;
			client.yaw = yaw;
			client.pitch = pitch;
			client.avatar = avatar;
			self.emitter.emit('client.state', client);
		});

		// Client sent us voxel changes for one or more chunks
		connection.on('chunkVoxelIndexValue', function(changes: any) {
			// Update our chunk store
			self.chunkStore.gotChunkChanges(changes);

			// Re-broadcast this to the other players, too
			for (var chunkID in changes) {
				var chunkChanges = {};
				chunkChanges[chunkID] = changes[chunkID];

				self.encodedChunkCache.remove(chunkID);
				for (var clientId in self.clients) {
					var client;
					var connection;
					// Don't broadcast to the client that sent us the info
					if (clientId === id) {
						continue;
					}
					client = self.clients[clientId];
					if (!client.connected) {
						continue;
					}
					if (debug) {
						console.log('sending to', clientId, arguments);
					}
					// emit over connection
					client.connection.emit('chunkVoxelIndexValue', chunkChanges);
				}
			}
		});

		// Client tells us which chunks it wants to hear about
		connection.on('onlyTheseChunks', function(chunks: any) {
			if (debug) {
				console.log('Client only cares about these chunks', chunks);
			}
			client.chunks = chunks;
		});

		// Client wants chunks. Keep track of which client wants chunks
		connection.on('needChunks', function(chunkIds: any) {
			if (debug) {
				console.log(client.id + ' needs chunks', chunkIds);
			}

			// Request the chunks we want
			for (var i = 0; i < chunkIds.length; i++) {
				var chunkId = chunkIds[i];
				if (!self.isChunkInBounds(chunkId)) {
					continue;
				}

				if (!(chunkId in self.chunksForClients)) {
					self.chunksForClients[chunkId] = {};
				}
				// Keep track of which client wants this chunk
				self.chunksForClients[ chunkId ][ client.id ] = true;
				self.chunkStore.get(chunkId);
			}
		});
	}

	// send message to all clients
	public broadcast (id: any, event: any, data?: any) {
		var self = this;
		// normalize arguments
		var len = arguments.length;
		var args = new Array(len);
		// skip client `id` argument
		for (var i = 0, j = 1; j < len; i++, j++) {
			args[i] = arguments[j];
		}
		// emit on self for module consumers, unless specified not to
		if (id !== 'server') {
			self.emitter.emit.apply(self, args);
		}
		for (var clientId in self.clients) {
			var client;
			var connection;
			// Don't broadcast to the client that sent us the info
			if (clientId === id) {
				continue;
			}
			client = self.clients[clientId];
			if (!client.connected) {
				continue;
			}
			if (debug) {
				console.log('sending to', clientId, args);
			}
			// emit over connection
			client.connection.emit.apply(client.connection, args);
		}
	}


	// broadcast position, rotation updates for each player
	public sendPlayers () {
		var self = this;
		var clientIds = Object.keys(self.clients);
		if (clientIds.length === 0) {
			return;
		}
		//console.log('Sending updates for ' + clientIds.length + ' clients')
		var players = {};

		clientIds.map(function(id) {
			var client = self.clients[id];
			if (!client.position) {
				return;
			}
			// TODO: Ignore client if they're really stale
			players[id] = {
				positions: [
					client.position[0],
					client.position[1],
					client.position[2],
					client.pitch,
					client.yaw,
					0
				],
				avatar: client.avatar
			};
		});

		self.broadcast(null, 'players', players);
	}


	public requestNearbyChunks (position: any) {
		var self = this;
		this.coords.nearbyChunkIDsEach(position, 2, function(chunkID: any) {
			self.chunkStore.get(chunkID);
		});
	}


	public sendChunk (chunk: any) {
		var self = this;
		var chunkId = chunk.chunkID;
		if (!(chunkId in this.chunksForClients)) {
			// Nobody's waiting for this chunk
			if (debug) {
				console.log('Nobody is waiting for ', chunkId);
			}
			return;
		}

		// GET IDS SO NO LOOP ITERATION ISSUES
		// LOOPS OVER CLIENT IDS TOO, PRUNING EMPTY OBJECTS
		var clientIds = Object.keys(this.chunksForClients[chunkId]);
		var i;
		for (i = 0; i < clientIds.length; i++) {
			var clientId = clientIds[i];
			var client;
			if (clientId in self.clients) {
				client = self.clients[clientId];
				if (client.connected) {
					let encoded = this.encodedChunkCache.get(chunkId);
					if (!encoded) {
						if (debug) {
							console.log('Adding ' + chunkId + ' to LRU');
						}
						encoded = encoder(chunk.voxels);
						self.encodedChunkCache.set(chunkId, encoded);
					} else {
						if (debug) {
							console.log('Found ' + chunkId + ' in LRU');
						}
					}
					if (debug) {
						console.log('Sending ' + chunkId + ' to client ' + clientId);
					}
					// Send chunkID so we can use it on the receving end as the key in our chunksToDecodeAndMesh object
					client.connection.emit('chunk', chunkId, encoded);
				}
			} else {
				console.log(clientId, ' not found in self.clients');
			}
			delete this.chunksForClients[chunkId][clientId];
		}

		var chunkIds = Object.keys(this.chunksForClients);
		for (i = 0; i < chunkIds.length; i++) {
			var _chunkId = chunkIds[i];
			var _clientIds = Object.keys(this.chunksForClients[_chunkId]);
			if (_clientIds.length === 0) {
				delete this.chunksForClients[_chunkId];
			}
		}
	}

	public isChunkInBounds (chunkID: any) {
		var self = this;
		var position = chunkID.split('|').map(function(value: any) {
			return Number(value);
		});
		if (
			position[0] < self.lastWorldChunks[0]
			||
			position[1] < self.lastWorldChunks[1]
			||
			position[2] < self.lastWorldChunks[2]
			||
			position[0] > self.lastWorldChunks[3]
			||
			position[1] > self.lastWorldChunks[4]
			||
			position[2] > self.lastWorldChunks[5]
		) {
			return false;
		}
		return true;
	}

	public on (name: any, callback: any) {
		this.emitter.on(name, callback);
	}
}
