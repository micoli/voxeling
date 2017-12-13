// dependencies;
import {EventEmitter} from 'events';
var duplexEmitter = require('duplex-emitter');
var extend = require('extend');
import {Game} from '../shared/voxel-engine-stackgl';
var crunch = require('voxel-crunch');
var ndarray = require('ndarray');
//var THREE = require('THREE');
import {avatarView} from './avatar-view';
//var voxelPlayer = require('voxel-player');
//var skin = require('minecraft-skin');
var glm = require('gl-matrix');

import {Client as WebSocketEmitterClient} from '../shared/web-socket-emitter';

module.exports = (game: any, opts: any) => new VoxelClient(game, opts);
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
	serverSettingBlock: any;
	avatar: any;
	name: any;
	constructor(game: Game, opts: any) {
		super();
		var self = this;
		self.opts = opts;
		self.game = game;
		self.texturePath = opts.texturePath || '/textures/';
		self.playerTexture = opts.playerTexture || 'player.png';
		self.lerpPercent = 0.1;
		self.remoteClients = {};
		self.connection = new EventEmitter();
		opts.getConnection(function(connection:any){
				//todo deal with proper connection a startup for other plugins
				//self.connection = new EventEmitter();
				console.log('Connection initialised');
				self.connection = connection;
				self.bindEvents(self.connection);
				setTimeout(function() {
					self.connection.emit('created');
				}, 1000);
		})
	}

	private scale(x: any, fromLow: any, fromHigh: any, toLow: any, toHigh: any) {
		return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
	}
	bindEvents(connection: any) {
		var self = this;
		// receive id from server;
		connection.on('id', function(id: any) {
			console.log('Id', id );
			self.playerID = id;
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

			connection.emit('created');
		});

		// load in chunks from the server;
		connection.on('chunk', function(encoded: any, meta: any) {
			console.log('encoded 22');
			// ensure `encoded` survived transmission as an array;
			// JSON stringifies Uint8Arrays as objects;
			if (encoded.length === undefined) {
				var lastIndex = Math.max.apply(null, Object.keys(encoded).map(Number));
				encoded.length = lastIndex + 1;
			}
			var chunk = ndarray(
				crunch.decode(encoded),
				meta.voxels.shape
				//meta.voxels.stride,
				//meta.voxels.offset
			);

			chunk.position = meta.position;
			chunk.dims = meta.dims;
			self.game.showChunk(chunk);
		});

		// after all chunks loaded;
		connection.on('noMoreChunks', function() {
			console.log('noMoreChunks');
			var game = self.game;

			// if not capable, throw error;
			if (game.notCapable()) {
				try {
					throw 'game not capable';
				} catch (err) {
					self.emit('error', err);
				}
			}
			console.log(11111);
			// create the player from a minecraft skin file and tell the;
			// game to use it as the main player;
			/*var createPlayer = voxelPlayer(game);
			var avatar = self.avatar = createPlayer(self.texturePath+self.playerTexture);
			avatar.possess();
			var position = game.settings.avatarInitialPosition;
			avatar.position.set(position[0], position[1], position[2]);
			*/
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
		console.log('initGame');

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
			//console.log('data',state);
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
			if (connection.readyState === connection.CLOSED) {
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
		connection.on('leave', function (id: any) {
			if (!self.remoteClients[id]) {
				return;
			}
			self.game.scene.remove(self.remoteClients[id].mesh);
			delete self.remoteClients[id];
		});
		function getNormalizedState (player:any){
			return {
				p: {
					x: Math.round(player.yaw.position.x*100)/100,
					y: Math.round(player.yaw.position.y*100)/100,
					z: Math.round(player.yaw.position.z*100)/100
				},
				r: {
					y: Math.round(player.yaw.rotation.y*200)/200,
					x: Math.round(player.pitch.rotation.x*200)/200
				}
			};
		}
		let currentState='';
		// send player state to server, mostly avatar info (position, rotation, etc.);
		function sendState() {
			var state = getNormalizedState(self.game.controls.target());
			let newState = JSON.stringify(state);
			if(currentState !== newState){
				currentState = newState;
				//console.log('state', newState);
				connection.emit('state', state);
			}
		}

		// process update from the server, mostly avatar info (position, rotation, etc.);
		function serverUpdate(updates: any) {
			Object.keys(updates.positions).map(function(playerID) {
				var update = updates.positions[playerID];

				// local player;
				if (playerID === self.playerID) {
					self.onServerUpdate(update);
					var state = getNormalizedState(self.game.controls.target());
					state.p.z-=10;
					self.updatePlayerPosition('uu',state);
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
		var to = new glm.vec3();
		to.copy(position);
		var from = this.game.controls.target().yaw.position;
		from.copy(from.lerp(to, this.lerpPercent));
	}

	updatePlayerPosition(id: any, update: any) {
		var self = this;
		var pos = update.p;
		var player = self.remoteClients[id];
		if (!player) {
			/*var mesh = new self.game.THREE.Mesh(
			new self.game.THREE.CubeGeometry(1, 3, 1), // width, height, depth
				self.game.materials.material
			)
			// paint the mesh with a specific texture in the atlas
			//self.game.materials.paint(mesh, 'obsidian')
			// move the item to some location
			mesh.position.set(0, 3, -5)
			var item = self.game.addItem({
				mesh: mesh,
				size: 3,
				//velocity: { x: 0, y: 0, z: 0 } // initial velocity
			})*/
			//var skin = require('minecraft-skin')
			//var duck = skin(THREE, 'neg.png')
			//var player = duck.createPlayerObject()
			//player.position.y -= 15
			/*scene.add(duckPlayer)
			//var createPlayer = require('voxel-player')(self.game);
			var player = createPlayer(self.texturePath+self.playerTexture,{scale:0.5});
			*/
			let player = new avatarView(self.game);
			let playerMesh = player.mesh;
			self.remoteClients[id] = player;
			//playerMesh.children[0].position.y = 10;
			//self.game.scene.add(player);
		}
		let playerSkin = self.remoteClients[id];
		let playerMesh = playerSkin.mesh;
		//playerSkin.meshShader.attributes.position = [update.p.x,update.p.y,update.p.z-5];
		//playerMesh.position.copy(playerMesh.position.lerp(pos, self.lerpPercent));
		//playerMesh.children[0].rotation.y = update.r.y + (Math.PI / 2);
		//playerSkin.head.rotation.z = this.scale(update.r.x, -1.5, 1.5, -0.75, 0.75);
	}

	updatePlayerGhost(id: any, update: any) {
		var self = this;
		var pos = update.p;
		var player = self.remoteClients[id];
		if (!player) {
			var createPlayer = voxelPlayer(self.game);
			var player = createPlayer(self.playerTexture);
			/*let playerSkin = skin(self.game.THREE, self.playerTexture, {
				scale: new glm.vec3(0.04, 0.04, 0.04)
			});*/
			//let playerMesh = playerSkin.mesh;
			self.remoteClients[id] = player;
			//playerMesh.children[0].position.y = 10;
			self.game.scene.add(player);
		}
		let playerSkin = self.remoteClients[id];
		let playerMesh = playerSkin.mesh;
		playerMesh.position.copy(playerMesh.position.lerp(pos, self.lerpPercent));
		playerMesh.children[0].rotation.y = update.r.y + (Math.PI / 2);
		playerSkin.head.rotation.z = this.scale(update.r.x, -1.5, 1.5, -0.75, 0.75);
	}
	/*getSkin(textureURI:any,id : any) {
		var self = this;
		var skin: any;
		var shader: any;
		var mesh: any;

		createSkinTexture(this.game.shell.gl, textureURI, this.playerTexture, 'image/png', function(err: any, texture: any) {
			self.remoteClients[id] = texture
		});

		mesh = createSkinMesh(this.game.shell.gl);

		shader = glslify({
			vertex: './avatar.vert'     // includes matrix transforms
		, fragment: './avatar.frag'   // applies texture
		})(this.game.shell.gl);

	}*/

}
