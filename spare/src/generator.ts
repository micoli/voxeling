//var stats = require('voxeling-stats')
var debug = false;


export class Generator {
	chunkArraySize: number;
	chunkSize: any;
	constructor(chunkSize: any) {
		if (!chunkSize) {
			throw 'Voxel-generator: chunkSize is required';
		}

		this.chunkSize = chunkSize;
		this.chunkArraySize = this.chunkSize * this.chunkSize * this.chunkSize;
	}

	// Default is a flat world
	generateVoxel (x: number, y: number, z: number, chunkSize: number):number {
		if (y < 1) {
			return 1; // grass and dirt
		}
		return 0;
	}

	get(chunkID: any) {
		if (debug) {
			console.log('Generator:generateChunk ' + chunkID);
		}
		var started = Date.now();
		var chunk = this.makeChunkStruct(chunkID);
		this.fillChunkVoxels(chunk, this.generateVoxel, this.chunkSize);
		//stats('generateChunk', started);
		return chunk;
	}


	// TODO: this needs to be accessible outside an instance, right?
	fillChunkVoxels(chunk: any, fn: any, chunkSize: number) {
		var lo = chunk.position;
		var ii = lo[0] + chunkSize;
		var jj = lo[1] + chunkSize;
		var kk = lo[2] + chunkSize;
		var index = 0;

		for (var k = lo[2]; k < kk; k++) {
			for (var j = lo[1]; j < jj; j++) {
				for (var i = lo[0]; i < ii; i++ , index++) {
					chunk.voxels[index] = fn(i, j, k, chunkSize);
				}
			}
		}
	}


	makeChunkStruct(chunkID: any) {
			var position = chunkID.split('|').map(function(value: any) {
				return Number(value);
			});
			return {
				position: position,
				chunkID: chunkID,
				voxels: new Uint8Array(this.chunkArraySize)
			};
		}
}
