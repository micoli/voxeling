// dependencies;
var crunch = require('voxel-crunch');
var ndarray = require('ndarray');
import { EventEmitter } from 'events';
import { Engine } from './voxel-engine-stackgl';
import { AvatarView } from './avatar-view/avatar-view';
import { Client as WebSocketEmitterClient } from '../shared/web-socket-emitter';

var debug = false;

module.exports = (engine: any, opts: any) => new VoxelClient(engine, opts);
module.exports.pluginInfo = {
	loadAfter: ['voxel-console']
};

export class VoxelClient extends EventEmitter {
	opts: any;
	playerID: any;
	engine: Engine;
	texturePath: any;
	playerTexture: any;
	remoteClients: any;
	serverStream: any;
	connection: any;
	serverSettingBlock: any;
	avatar: any;
	name: any;
	currentState:any={};
	isReady : boolean = false;

	constructor(engine: Engine, opts: any) {
		super();
		var self = this;
		self.opts = opts;
		self.engine = engine;
		self.texturePath = opts.texturePath || '/textures/';
		self.playerTexture = opts.playerTexture || 'player.png';
		self.remoteClients = {};
		self.connection = new EventEmitter();

		opts.getConnection(function(connection:any){
			//todo deal with proper connection a startup for other plugins
			console.log('Connection initialised');
			self.connection = connection;
			self.bindEvents();
			setTimeout(function() {
				self.connection.emit('created');
			}, 300);
		})
	}

	bindEvents() {
		var self = this;

		self.connection.on('id', function(id: any) {
			console.log('receiving id', id );
			self.playerID = id;
		});

		self.connection.on('settings', function(settings: any) {
			console.log('receiving settings', settings);
			// set client-specific settings;
			settings.isClient = true;
			settings.texturePath = self.texturePath;
			settings.generateChunks = false;
			settings.controlsDisabled = false;
			// tell server we're ready;
			self.initGame(settings);

			self.connection.emit('created');
		});

		// load in chunks from the server;
		self.connection.on('chunk', function(encoded: any, meta: any) {
			// ensure `encoded` survived transmission as an array;
			// JSON stringifies Uint8Arrays as objects;
			if (encoded.length === undefined) {
				var lastIndex = Math.max.apply(null, Object.keys(encoded).map(Number));
				encoded.length = lastIndex + 1;
			}
			var chunk = ndarray(crunch.decode(encoded),meta.voxels.shape);
			if(debug){
				console.log('receiver chunk ',meta.position.join(','))
			}
			chunk.position = meta.position;
			chunk.dims = meta.dims;
			self.engine.showChunk(chunk);
		});

		// after all chunks loaded;
		self.connection.on('noMoreChunks', function() {
			console.log('noMoreChunks');
			var engine = self.engine;

			// if not capable, throw error;
			if (engine.notCapable()) {
				try {
					throw 'engine not capable';
				} catch (err) {
					self.emit('error', err);
				}
			}
			// tell modules consumers we're ready;
			self.emit('loadComplete');
		});

		// fires when server sends us voxel edits;
		self.connection.on('set', function(pos: any, val: any) {
			self.serverSettingBlock = true;
			self.engine.setBlock(pos, val);
			self.serverSettingBlock = false;
		});

		// handle server updates;
		self.connection.on('update', function(updates: any) {
			if(!self.isReady){
				return;
			}
			Object.keys(updates.positions).map(function(playerID) {
				var update = updates.positions[playerID];

				if (playerID === self.playerID) {
					self.onServerUpdate(update);
				} else {
					self.updatePlayerPosition(playerID, update);
				}
			});
		});

		// handle removing clients that leave;
		self.connection.on('leave', function (id: any) {
			if (!self.remoteClients[id]) {
				return;
			}
			delete self.remoteClients[id];
		});

	}

	initGame(settings: any) {
		var self = this;
		var connection = self.connection;
		console.log('InitGame');

		var name = localStorage.getItem('name');
		if (!name) {
			name = 'player name';
			localStorage.setItem('name', name);
		}
		self.name = name;

		// handle controls;
		self.engine.controls.on('data', function(state: any) {
			//console.log('data',state);
			var interacting = false;
			Object.keys(state).map(function(control) {
				if (state[control] > 0) {
					interacting = true;
				}
			});
			if (interacting) {
				self.sendState();
			}
		});

		self.engine.voxels.on('missingChunk', function(pos: any) {
			console.log('missingChunk ask', pos, connection.readyState === connection.CLOSED);
			if (connection.readyState === connection.CLOSED) {
				return;
			}
			connection.emit('missingChunk', pos);
		});

		// send voxel edits;
		self.engine.on('setBlock', function(pos: any, val: any) {
			if (self.serverSettingBlock) {
				return;
			}
			connection.emit('set', pos, val);
		});


		// delay is because three.js seems to throw errors if you add stuff too soon;
		setTimeout(function() {
			self.isReady = true;
		}, 1000);

		return self.engine;
	}

	private sendState() {
		var state = this.getNormalizedState(this.engine.controls.target());
		let newState = JSON.stringify(state);
		if(this.currentState !== newState){
			this.currentState = newState;
			this.connection.emit('state', state);
		}
	}

	private getNormalizedState (player:any){
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

	private onServerUpdate(update: any) {
		var self = this;
		//var state = this.getNormalizedState(self.engine.controls.target());
	}

	private updatePlayerPosition(id: any, update: any) {
		var self = this;
		if (!self.remoteClients[id]) {
			self.remoteClients[id] = new AvatarView(self.engine);
			self.remoteClients[id].walk();
		}
		self.remoteClients[id].update(update);
	}
	enable(){
	}
	disable(){
	}
}
