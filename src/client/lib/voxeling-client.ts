var EventEmitter = require('events').EventEmitter;
var pool = require('./object-pool');
var log = require('../../shared/log')('lib/client', true);
import {Camera} from './camera';
import {Game} from './game';
import {Voxels} from './voxels';

export class VoxelingClient {
	_camera: Camera;
	_game: Game;
	_voxels: Voxels;
	receivedChunks: any[];
	connected: boolean;
	emitter: any;
	players: any;
	avatar: string;
	player: any;
	id: any;
	server: any;
	settings: any;
	worker: any;

	constructor(settings: any) {
		var self = this;
		this.settings = settings;
		this.server = settings.server;
		// These will be set later
		this.id = null;
		this.player = null;
		this.avatar = 'player';
		this.players = null;
		this.voxels = null;
		this.camera = null;
		this.game = null;
		this.connected = false;
		this.receivedChunks = [];
		this.emitter = new EventEmitter();
		//console.log('Worker', Worker);
		this.worker = new Worker('/client/client-worker.js');

		this.bindEvents();
		this.otherSetup();

		this.worker.postMessage(['connect']);
	}

	get camera(): Camera {
		return this._camera;
	}

	set camera(_camera: Camera) {
		this._camera = _camera;
	}

	get game(): Game {
		return this._game;
	}

	set game(_game: Game) {
		this._game = _game;
	}

	get voxels(): Voxels {
		return this._voxels;
	}

	set voxels(_voxels: Voxels) {
		this._voxels = _voxels;
	}

	// Listen for certain events/data from the server
	bindEvents() {
		var self = this;
		var messageHandlers: any = {
			'open': function() {
				self.connected = true;
				log('Client.bindEvents: connection opened');
				self.emitter.emit('open');
			},
			'close': function() {
				self.connected = false;
				log('Client.bindEvents: connection closed');
				self.emitter.emit('close');
			},
			'error': function(message: any) {
				log('Client.bindEvents.error: ' + message);
			},
			'settings': function(settings: any, id: any) {
				// merge settings from server into those from the client side
				// TODO: fix this for new engine setup
				//self.settings = extend(self.settings, settings) // server settings squash client settings
				log('Client.bindEvents: Got settings', settings);
				if ('initialPosition' in settings) {
					self.settings.initialPosition = settings.initialPosition;
				}
				self.id = id;
				//self.player.avatarImage = avatarImage
				log('Client.bindEvents: got id ' + id);
				// setup complete, do we need to do additional engine setup?
				self.emitter.emit('ready');
			},

			'chunkVoxels': function(chunk: any) {
				log('chunkVoxels ' + chunk.chunkID + ' ' + chunk.position);
				self.game.storeVoxels(chunk);
			},

			// Game no longer needs to hold this voxel data
			'nearbyChunks': function(chunks: any) {
				//if (self.game.nearbyChunks) {
					self.game.nearbyChunks(chunks);
				//} else {
				//	self.game.removeFarChunks();
				//}
			},

			// Chunk was re-meshed
			'chunkMesh': function(chunkID: any, mesh: any) {
				log('chunkMesh ' + JSON.stringify(chunkID));
				self.voxels.showMesh(chunkID, mesh);
			},
			'meshesToShow': function(meshDistances: any) {
				self.voxels.meshesToShow(meshDistances);
			},

			// Worker relays voxel changes from the server to us
			'chunkVoxelIndexValue': function(changes: any) {
				self.game.updateVoxelCache(changes);
			},

			'chat': function(message: any) {
				var messages = document.getElementById('messages');
				var el = document.createElement('dt');
				el.innerText = message.user;
				messages.appendChild(el);
				el = document.createElement('dd');
				el.innerText = message.text;
				messages.appendChild(el);
				messages.scrollTop = messages.scrollHeight;
			},

			// Got batch of player position updates
			'players': function(players: any) {
				delete players[self.id];
				self.emitter.emit('players', players);
			}
		};

		this.worker.onmessage = function(e: any) {
			var message = e.data;
			var _type = message.shift();
			messageHandlers[_type].apply(self, message);
		};
	}

	regionChange() {
		this.worker.postMessage([
			'regionChange',
			this.player.getPosition(),
			this.camera.follow.getRotationQuat(),
			this.settings.drawDistance,
			this.settings.removeDistance
		]);
	}

	otherSetup() {
		var self = this;

		// TODO: send position to web worker
		setInterval(function() {
			if (!self.player) {
				return;
			}
			self.worker.postMessage(
				['playerPosition', self.player.getPosition(), self.player.getYaw(), self.player.getPitch(), self.avatar]
			);
		}, 1000 / 10);
	}

	on(name: any, callback: any) {
		this.emitter.on(name, callback);
	}
}
