import {Generator} from '../generator';
var noise = require('perlin').noise;

var debug = false;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export class ServerPerlinGenerator extends Generator {
	constructor(chunkSize: number) {
		super(chunkSize);
		// 1 block rise, each ring of chunks out from center
	}
	generateVoxel(x: number, y: number, z: number, chunkSize: number): number {
		if (y === 0) {
			return 1;
		}
		if (y < 0) {
			// N = 800
			// 2 in N chance of obsidian
			// 5 in N chance of empty
			// 1 in N chance of lava
			// 2 in N chance of granite
			// 2 in N chance of slate
			var chance = getRandomInt(1, 800);
			if (chance < 3) {
				return 4; // obsidian
			} else if (chance < 8) {
				return 0; // empty
			} else if (chance === 8) {
				return 7; // lava
			} else if (chance < 11) {
				return 13; // granite
			} else if (chance < 14) {
				return 19; //slate
			}
			// Otherwise, dirt
			return 3;
		}
		var chunkX = Math.abs(Math.floor(x / chunkSize));
		//var chunkY = Math.abs(Math.floor(y / chunkSize))
		var chunkZ = Math.abs(Math.floor(z / chunkSize));
		var out = Math.max(chunkX, chunkZ);
		if (y <= out) {
			return 1;
		}
		return 0;
	}
	fillChunkVoxels (chunk: any, fn: any, width: number) {
		var position = chunk.position;
		var startX = position[0];
		var startY = position[1];
		var startZ = position[2];
		var voxels = chunk.voxels;
		pointsInside(startX, startZ, width, function(x: number, z: number) {
			var n = noise.simplex2(x / divisor, z / divisor);
			var y = ~~scale(n, -1, 1, floor, ceiling);
			if (y === floor || startY < y && y < startY + width) {
				var xidx = Math.abs((width + x % width) % width);
				var yidx = Math.abs((width + y % width) % width);
				var zidx = Math.abs((width + z % width) % width);
				var idx = xidx + yidx * width + zidx * width * width;
				voxels[idx] = 1;
				// now that we've set the crust, loop down and create earth underneath
				for (var i = y; i >= startY; i--) {
					let idx = xidx + Math.abs((width + i % width) % width) * width + zidx * width * width;
					voxels[idx] = 1;
				}
			}
		});
	}
}


var floor = 0;
var ceiling = 20;
// minecraft's limit
var divisor = 50;
var seed = 8484747474747;

noise.seed(seed);

function pointsInside(startX: number, startY: number, width: number, func: any) {
	for (var x = startX; x < startX + width; x++) {
		for (var y = startY; y < startY + width; y++) {
			func(x, y);
		}
	}
}

function scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
	return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}
