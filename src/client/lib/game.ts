var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;

import {EventEmitter} from 'events';
var pool = require('../lib/object-pool');
var log = require('../../shared/log')('lib/game', false);
var interact = require('interact');

var previousTimeStamp = 0;

export class Game extends EventEmitter {
	interact: any;
	regionChangeCallback: any;
	currentVoxels: any;
	coordinates: any;
	config: any;
	updateNeedsCallback: any;
	frustum: any;
	isClient : boolean = true;
	player: any;
	lastRegion: number[];
	currentVoxel: any[];

	constructor(config: any, coordinates: any, player: any, regionChangeCallback: any) {
		super();
		var self = this;
		this.currentVoxel = new Array(3);
		// if this is vec3.create(), floating point messes things up
		this.lastRegion = [ 0, 0, 0 ];
		this.player = player;
		this.regionChangeCallback = regionChangeCallback;

		// Extract relevant values from config
		this.config = config;
		this.coordinates = coordinates;

		// Same as above, but for voxel arrays
		this.currentVoxels = {};
		this.interact = new EventEmitter();
	}

	storeVoxels(chunk: any) {
		var chunkID = chunk.chunkID;
		log('Game.storeVoxels: storing voxels for ' + chunkID);
		this.currentVoxels[ chunkID ] = chunk;
	}

	nearbyChunks(chunks: any) {
		for (var chunkId in this.currentVoxels) {
			if (!(chunkId in chunks)) {
				delete this.currentVoxels[chunkId];
			}
		}
	}

	positionChange(position: any) {
		var thisRegion = this.coordinates.positionToChunk(position);
		var lastRegion = this.lastRegion;
		if (thisRegion[0] !== lastRegion[0] || thisRegion[1] !== lastRegion[1] || thisRegion[2] !== lastRegion[2]) {
			this.regionChangeCallback(position);
		}
		this.lastRegion = thisRegion;
	}

	// This is only used for collision detection
	getBlock(x: number, y: number, z: number) {
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

	/*
	Modifies the chunkVoxelIndexValue data structure
	*/
	setBlock(x: number, y: number, z: number, value:any, chunkVoxelIndexValue:any, touching?:any) {
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
	updateVoxelCache(changes:any) {
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

	setPlayers(players:any) {
		return;
	}
}
