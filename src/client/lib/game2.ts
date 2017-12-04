var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;

var pool = require('../lib/object-pool');
var log = require('./log')('lib/game', false);

// miscellaneous state
var previousTimeStamp = 0;
export class Game {
	currentVoxels: any;
	coordinates: any;
	config: any;
	updateNeedsCallback: any;
	frustum: any;
	player: any;
	lastRegion: number[];
	currentVoxel: any[];
	constructor(config: any, coordinates: any, player: any, regionChangeCallback: any) {
		var self = this;
		this.currentVoxel = new Array(3);
		// if this is vec3.create(), floating point messes things up
		this.lastRegion = [ 0, 0, 0 ];
		this.player = player;
		this.frustum = null;
		this.updateNeedsCallback = null; //updateNeedsCallback;

		// Extract relevant values from config
		this.config = config;
		this.coordinates = coordinates;

		// Same as above, but for voxel arrays
		this.currentVoxels = {};
	}

	/*
	 * Getting tired and confused.
	 * Trying to simplify handling of mesh and voxel cache.
	 * Game needs some access, but I'd like lib/client to not
	 * have to go to game for all operations. Hum. Needs a rethink
	*/
	storeVoxels(chunk: any) {
		var chunkID = chunk.chunkID;
		log('Game.storeVoxels: storing voxels for ' + chunkID);
		this.currentVoxels[ chunkID ] = chunk;
	}

	positionChange(position: any) {
		var thisRegion = this.coordinates.positionToChunk(position);
		var lastRegion = this.lastRegion;
		if (thisRegion[0] !== lastRegion[0] || thisRegion[1] !== lastRegion[1] || thisRegion[2] !== lastRegion[2]) {
			this.regionChange(position);
		}
		this.lastRegion = thisRegion;
	}

	regionChange(playerPosition: any) {
		var self = this;
		var i;
		log('Game.regionChange: playerPosition is', playerPosition);

		// These help us remove voxels and meshes we no longer need
		var nearbyVoxels = {};
		// We tell our web worker about these, so it knows what to fetch and return
		var onlyTheseVoxels:any[] = [];
		var missingVoxels:any[] = [];

		var meshHash = {};
		var len = self.config.drawDistance * 3;
		var priority = new Array(len);
		for (i = 0; i < len; i++) {
			priority[i] = [];
		}
		var addPriority = function(level:any, chunkID:any) {
			log('Game.regionChange.addPriority: level', level);
			priority[level].push(chunkID);
		};

		// Hmm, I seem to have removed the removeDistance logic. do we still want that 1 chunk buffer zone?
		this.coordinates.nearbyChunkIDsEach(
			playerPosition,
			self.config.removeDistance,
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
				if (distanceAway <= self.config.removeDistance) {
					nearbyMeshes[chunkID] = 0;
				}
				*/

				// Set fetch priority
				if (distanceAway < 2) {
					addPriority(distanceAway, chunkID);
					meshHash[ chunkID ] = 0;
				} else if (distanceAway <= self.config.drawDistance) {
					// If outside frustum, add config.drawDistnace to distanceAway as priority
					// Use frustum to determine our fetch priority.
					// We want visible meshes to be fetched and drawn first
					if (self.frustum.chunkVisible(chunkID, chunkPosition)) {
						addPriority(distanceAway, chunkID);
					} else {
						addPriority(distanceAway + self.config.removeDistance, chunkID);
					}
					meshHash[ chunkID ] = 0;
				} else if (distanceAway <= self.config.removeDistance) {

				}
			}
		);

		var prioritized: any[] = [];
		for (i = 0; i < priority.length; i++) {
			Array.prototype.push.apply(prioritized, priority[i]);
		}

		self.updateNeedsCallback(prioritized, meshHash, onlyTheseVoxels, missingVoxels);

		log('nearbyVoxels', nearbyVoxels);

		var chunkIds = Object.keys(self.currentVoxels);
		for (i = 0; i < chunkIds.length; i++) {
			var chunkId = chunkIds[i];
			// If a chunk is visible it should be in cache. If it's not visible, shouldn't be in chunkCache
			if (chunkId in nearbyVoxels) {
				continue;
			}
			log('Game.regionChange removing from currentVoxels', chunkId);
			var chunk = self.currentVoxels[ chunkId ];
			delete self.currentVoxels[chunkId];
		}
	}

	// This is only used for collision detection
	getBlock(x:number, y:number, z:number) {
		var chunkID = this.coordinates.coordinatesToChunkID(x, y, z);
		if (chunkID in this.currentVoxels) {
			var voxelIndex = this.coordinates.coordinatesToVoxelIndex(x, y, z);
			var voxelValue = this.currentVoxels[chunkID].voxels[voxelIndex];
			// Uncomment the following when I'm ready to make water walkable
			return (voxelValue > 0); // && voxelValue != 6);
		} else {
			log('Game.getBlock: chunkid not found');
		}
		// if chunk doesn't exist, act like it's full of blocks (keep player out)
		return 1;
	}

	// Think we should have a fourth parameter that gets filled with details so we don't have to construct a chunkVoxelIndexValue afterwards
	/*
	Modifies the chunkVoxelIndexValue data structure
	*/
	setBlock(x:number, y:number, z:number, value: any, chunkVoxelIndexValue: any, touching: any) {
		var parts = this.coordinates.coordinatesToChunkAndVoxelIndex(x, y, z, touching);
		var chunkID = parts[0];
		var voxelIndex = parts[1];
		this.currentVoxels[chunkID].voxels[voxelIndex] = value;

		// Maybe some memoize setup could help with this
		if (chunkID in chunkVoxelIndexValue) {
			chunkVoxelIndexValue[chunkID].push(voxelIndex, value);
		} else {
			chunkVoxelIndexValue[chunkID] = [
				voxelIndex,
				value
			];
		}
	}

	// When webworker gets voxel changes, lib/client relays them here
	updateVoxelCache(changes: any) {
		var self = this;
		for (var chunkID in changes) {
			if (chunkID in self.currentVoxels) {
				var chunk = self.currentVoxels[chunkID];
				var details = changes[chunkID];
				for (var i = 0; i < details.length; i += 2) {
					var index = details[i];
					var val = details[i + 1];
					chunk.voxels[index] = val;
				}
			}
		}
	}

	// drawing and whatnot
	tick() {
		this.positionChange(this.player.getPosition());
	}

	setPlayers(players: any) {
		return;
	}
}

module.exports = Game;
