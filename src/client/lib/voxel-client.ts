// dependencies;
import {EventEmitter} from 'events';
var duplexEmitter = require('duplex-emitter');
var extend = require('extend');
import {Game} from '../../shared/voxel-engine-stackgl';
var skin = require('minecraft-skin');
var crunch = require('voxel-crunch');
var voxelPlayer = require('voxel-player');
var ndarray = require('ndarray');

function scale(x: any, fromLow: any, fromHigh: any, toLow: any, toHigh: any) {
	return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}
//module.exports = (game:any, opts:any) => new VoxelClient(game, opts);
module.exports.pluginInfo = {
	loadAfter: ['voxel-console']
};

export class VoxelClient extends EventEmitter {
	opts: any;
	playerID: any;
	game: Game;
	texturePath: any;
	playerTexture: any;
	lerpPercent: any;
	remoteClients: any;
	serverStream: any;
	connection: any;
	serverSettingBlock : any;
	avatar:any;
	name:any;
	constructor(game: Game, opts:any) {
		super();
		var self = this;
		// allow module consumers to listen to ee2 events;
		// set initial values;
		self.opts = opts;
		self.game = game;
		self.texturePath = opts.texturePath || '/textures/';
		self.playerTexture = opts.playerTexture || 'player.png';
		self.lerpPercent = 0.1;
		self.remoteClients = {};
		self.serverStream = opts.serverStream;

		// expose emitter methods on client;
		//extend(self, new EventEmitter());

		// create 'connection' remote event emitter from duplex stream;
		//self.connection = duplexEmitter(opts.serverStream);
		self.connection = opts.serverStream;
		// setup server event handlers;
		self.bindEvents(self.connection);
		self.connection.emit('created');
	}

	bindEvents(connection: any) {
		var self = this;
		console.log('bind');
		// receive id from server;
		connection.on('id', function(id: any) {
			console.log('Id', id);
			self.playerID = id;
		});
		connection.emitter.on('data', function(settings: any) {
			console.log('data',arguments);
		});
		connection.emitter.on('settings', function(settings: any) {
			console.log('settings',arguments);
		});

		// receive initial game settings;
		connection.on('settings', function(settings: any) {
			console.log('settings', settings);
			// set client-specific settings;
			settings.isClient = true;
			settings.texturePath = self.texturePath;
			settings.generateChunks = false;
			settings.controlsDisabled = false;
			// tell server we're ready;
			self.initGame(settings);

			////connection.emit('created');
		});

		// load in chunks from the server;
		connection.on('chunk', function(encoded: any, chunk: any) {
			console.log('encoded', encoded);
			// ensure `encoded` survived transmission as an array;
			// JSON stringifies Uint8Arrays as objects;
			if (encoded.length === undefined) {
				var lastIndex = Math.max.apply(null, Object.keys(encoded).map(Number));
				encoded.length = lastIndex + 1;
			}
			var voxels = crunch.decode(encoded, chunk.length);
			chunk.voxels = voxels; // ndarray();
			self.game.showChunk(chunk);
		});

		// after all chunks loaded;
		connection.on('noMoreChunks', function() {
			var game = self.game;

			// if not capable, throw error;
			if (game.notCapable()) {
				try {
					throw 'game not capable';
				} catch (err) {
					self.emit('error', err);
				}
			}

			// create the player from a minecraft skin file and tell the;
			// game to use it as the main player;
			var createPlayer = voxelPlayer(game);
			var avatar = self.avatar = createPlayer(self.playerTexture);
			avatar.possess();
			var position = game.settings.avatarInitialPosition;
			avatar.position.set(position[0], position[1], position[2]);

			// tell modules consumers we're ready;
			self.emit('loadComplete');
		});

		// fires when server sends us voxel edits;
		connection.on('set', function(pos: any, val: any) {
			self.serverSettingBlock = true;
			self.game.setBlock(pos, val);
			self.serverSettingBlock = false;
		});
	}

	enable() {
		console.log('client enable');
	}

	disable() {
		console.log('client disable');
	}

	initGame(settings: any) {
		var self = this;
		var connection = self.connection;

		// retrieve name from local storage;
		var name = localStorage.getItem('name');
		// if no name, choose a random name;
		if (!name) {
			name = 'player name';
			localStorage.setItem('name', name);
		}
		self.name = name;

		// handle controls;
		self.game.controls.on('data', function(state: any) {
			var interacting = false;
			Object.keys(state).map(function(control) {
				if (state[control] > 0) {
					interacting = true;
				}
			});
			if (interacting) {
				sendState();
			}
		});
		console.log('registered');
		self.game.voxels.on('missingChunk', function(pos: any) {
			console.log('missingChunk ask', pos, connection.readyState === connection.CLOSED);
			if (connection.readyState === connection.CLOSED ) {
			//	return;
			}
			connection.emit('missingChunk', pos);
		});
		// send voxel edits;
		self.game.on('setBlock', function(pos: any, val: any) {
			if (self.serverSettingBlock) {
				return;
			}
			connection.emit('set', pos, val);
		});

		// handle server updates;
		// delay is because three.js seems to throw errors if you add stuff too soon;
		setTimeout(function() {
			connection.on('update', serverUpdate);
		}, 1000);

		// handle removing clients that leave;
		connection.on('leave', removeClient);

		// return the game object;

		// send player state to server, mostly avatar info (position, rotation, etc.);
		function sendState() {
			var player = self.game.controls.target();
			var state = {
				position: player.yaw.position,
				rotation: {
					y: player.yaw.rotation.y,
					x: player.pitch.rotation.x
				}
			};
			connection.emit('state', state);
		}

		// unregister a remote client;
		function removeClient(id: any) {
			if (!self.remoteClients[id]) {
				return;
			}
			self.game.scene.remove(self.remoteClients[id].mesh);
			delete self.remoteClients[id];
		}

		// process update from the server, mostly avatar info (position, rotation, etc.);
		function serverUpdate(updates: any) {
			Object.keys(updates.positions).map(function(player) {
				var update = updates.positions[player];

				// local player;
				if (player === self.playerID) {
					self.onServerUpdate(update);
					// other players;
				} else {
					self.updatePlayerPosition(player, update);
				}
			});
		}
		return self.game;
	}

	onServerUpdate(update: any) {
		var self = this;
		// todo use server sent location;
	}

	lerpMe(position: any) {
		var self = this;
		var to = new this.game.THREE.Vector3();
		to.copy(position);
		var from = this.game.controls.target().yaw.position;
		from.copy(from.lerp(to, this.lerpPercent));
	}

	updatePlayerPosition(id: any, update: any) {
		var self = this;
		var pos = update.position;
		var player = self.remoteClients[id];
		if (!player) {
			let playerSkin = skin(self.game.THREE, self.playerTexture, {
				scale: new self.game.THREE.Vector3(0.04, 0.04, 0.04)
			});
			let playerMesh = playerSkin.mesh;
			self.remoteClients[id] = playerSkin;
			playerMesh.children[0].position.y = 10;
			self.game.scene.add(playerMesh);
		}
		let playerSkin = self.remoteClients[id];
		let playerMesh = playerSkin.mesh;
		playerMesh.position.copy(playerMesh.position.lerp(pos, self.lerpPercent));
		playerMesh.children[0].rotation.y = update.rotation.y + (Math.PI / 2);
		playerSkin.head.rotation.z = scale(update.rotation.x, -1.5, 1.5, -0.75, 0.75);
	}

}
