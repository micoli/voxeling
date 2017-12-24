var distances = require('./distances');

/*module.exports = function(opts) {
	return new Coordinates(opts);
};
*/
//module.exports.Coordinates = Coordinates;
export class Coordinates {
	chunkSize: number;
	chunkMask: any;
	voxelMask: any;
	constructor(chunkSize:number) {
		this.chunkSize = chunkSize || 32;

		if ( (this.chunkSize & this.chunkSize - 1) !== 0) {
			throw new Error('chunkSize must be a power of 2');
		}
		this.voxelMask = this.chunkSize - 1;
		this.chunkMask = ~this.voxelMask;
	}

	nearbyChunkIDsEach(position: any, maxDistance:number, callback: any) {
		var current = this.positionToChunk(position);
		var x = current[0];
		var y = current[1];
		var z = current[2];

		for (var distanceAway = 0; distanceAway <= maxDistance; distanceAway++) {
			var chunks = distances[distanceAway];
			for (var j = 0; j < chunks.length; j++) {
				// Create a copy so we can modity
				var chunk = chunks[j].slice();
				chunk[0] += x;
				chunk[1] += y;
				chunk[2] += z;
				callback(chunk.join('|'), chunk, distanceAway);
			}
		}
	}

	// Use lower boundary as the chunk position/ID
	coordinatesToChunkID(x:number, y:number, z:number) {
		var mask = this.chunkMask;
		var cx = x & mask;
		var cy = y & mask;
		var cz = z & mask;
		return cx + '|' + cy + '|' + cz;
	}

	positionToChunk(position: any) {
		return this.coordinatesToChunk(position[0], position[1], position[2]);
	}

	coordinatesToChunk(x:number, y:number, z:number) {
		var mask = this.chunkMask;
		var cx = x & mask;
		var cy = y & mask;
		var cz = z & mask;
		return [cx, cy, cz];
	}

	positionToChunkID(position:any) {
		return this.coordinatesToChunkID(position[0], position[1], position[2]);
	}

	coordinatesToVoxelIndex(x:number, y:number, z:number, touching?:any) {
		var voxelMask = this.voxelMask;
		var vx = x & voxelMask;
		var vy = y & voxelMask;
		var vz = z & voxelMask;
		var index = vx + (vy * this.chunkSize) + (vz * this.chunkSize * this.chunkSize);
		return index;
	}

	coordinatesToChunkAndVoxelIndex(x:number, y:number, z:number, touching:any) {
		var chunkMask = this.chunkMask;
		var voxelMask = this.voxelMask;
		var cx = x & chunkMask;
		var cy = y & chunkMask;
		var cz = z & chunkMask;
		var chunkId = cx + '|' + cy + '|' + cz;
		var vx = x & voxelMask;
		var vy = y & voxelMask;
		var vz = z & voxelMask;
		//var val = chunk.voxels.get(mx, my, mz)
		var index = vx + (vy * this.chunkSize) + (vz * this.chunkSize * this.chunkSize);

		// Fill touching with chunk ids that this voxel touches
		if (!!touching) {
			if (vx === 0) {
				touching[
					(cx - 32) + '|' + cy + '|' + cz
				] = true;

			} else if (vx === 31) {
				touching[
					(cx + 32) + '|' + cy + '|' + cz
				] = true;
			}
			if (vy === 0) {
				touching[
					cx + '|' + (cy - 32) + '|' + cz
				] = true;

			} else if (vy === 31) {
				touching[
					cx + '|' + (cy + 32) + '|' + cz
				] = true;
			}
			if (vz === 0) {
				touching[
					cx + '|' + cy + '|' + (cz - 32)
				] = true;

			} else if (vz === 31) {
				touching[
					cx + '|' + cy + '|' + (cz + 32)
				] = true;
			}
		}
		return [chunkId, index];
	}

	positionToVoxelIndex(pos:any) {
		return this.coordinatesToVoxelIndex(pos[0], pos[1], pos[2]);
	}

	lowToHighEach(low:any, high:any, callback:any) {
		for (var i = low[0]; i <= high[0]; i++) {
			for (var j = low[1]; j <= high[1]; j++) {
				for (var k = low[2]; k <= high[2]; k++) {
					callback(i, j, k);
				}
			}
		}
	}
}
