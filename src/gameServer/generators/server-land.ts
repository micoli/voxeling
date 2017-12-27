import {Generator} from '../generator';
import { VoxelServer } from '../voxel-server';
var noise = require('perlin').noise;

var debug = false;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export class ServerLandGenerator extends Generator {
	baseServer:VoxelServer;
	floor:number = 0;
	ceiling:number = 50;
	divisor:number = 20;
	seed:any = 8484747471747;

	constructor(chunkSize: number,baseServer:VoxelServer) {
		super(chunkSize);
		this.baseServer = baseServer;
		noise.seed(this.seed);
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
				return 2; // obsidian
			} else if (chance < 8) {
				return 0; // empty
			} else if (chance === 8) {
				return 3; // lava
			} else if (chance < 11) {
				return 4; // granite
			} else if (chance < 14) {
				return 10; //slate
			}
			// Otherwise, dirt
			return 1;
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
		var self = this;
		var position = chunk.position;
		var startX = position[0];
		var startY = position[1];
		var startZ = position[2];
		var voxels = chunk.voxels;
		if(startY<-10){
			 for (var i = 0; i < 32768; i++) {
				 voxels[i]=1;
			 }
			 return ;
		}
		if(startY>=2){
			for (var i = 0; i < 32768; i++) {
   			 voxels[i]=0;
   		 }
   		 return ;
   	}

		self.pointsInside(startX, startZ, width, function(x: number, z: number) {
			var n = noise.simplex2(x / self.divisor, z / self.divisor);
			var y = ~~self.scale(n, -1, 1, self.floor, self.ceiling);
			if (y === self.floor || startY < y && y < startY + width) {
				var xidx = Math.abs((width + x % width) % width);
				var yidx = Math.abs((width + y % width) % width);
				var zidx = Math.abs((width + z % width) % width);
				var idx = xidx + yidx * width + zidx * width * width;
				voxels[idx] = 1;//self.generateVoxel(x,0,z,32);;
				// now that we've set the crust, loop down and create earth underneath
				for (var i = y; i >= startY; i--) {
					let idx = xidx + Math.abs((width + i % width) % width) * width + zidx * width * width;
					voxels[idx] = [1,2,3,4,10][getRandomInt(0, 4)] ;//self.generateVoxel(x,i,z,32)
				}
			}
		});
	}

	pointsInside(startX: number, startY: number, width: number, func: any) {
		for (var x = startX; x < startX + width; x++) {
			for (var y = startY; y < startY + width; y++) {
				func(x, y);
			}
		}
	}

	scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
		return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
	}
}
