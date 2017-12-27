import {Generator} from '../generator';
import { VoxelServer } from '../voxel-server';
var noise = require('perlin').noise;
import materialsMap from './server-land-materials';
var debug = false;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export class ServerLandGenerator extends Generator {
	baseServer:VoxelServer;
	floor:number = 0;
	ceiling:number = 20;
	divisor:number = 50;
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

	fillFullChunk(chunk:any,materials:number[]){
		//https://stackoverflow.com/questions/12672765/elegant-way-to-generate-a-random-value-regarding-percentage
		for (var i = 0; i < 32768; i++) {
			chunk.voxels[i]=materials[getRandomInt(0,materials.length-1)];
		}
	}

	fillChunkVoxels (chunk: any, fn: any, width: number) {
		var self = this;
		var position = chunk.position;
		var chunkX = position[0];
		var chunkY = position[1];
		var chunkZ = position[2];
		var voxels = chunk.voxels;
		if(chunkY<-10){
			this.fillFullChunk(chunk,[materialsMap.bedrock]);
			return ;
		}
		if(chunkY>=-10 && chunkY<=0){
			this.fillFullChunk(chunk,[materialsMap.bedrock,materialsMap.grass]);
			return ;
		}
		if(chunkY>1){
			this.fillFullChunk(chunk,[materialsMap.air]);
			return ;
		}

		self.pointsInside(chunkX, chunkZ, width, function(x: number, z: number) {
			var n = noise.simplex2(x / self.divisor, z / self.divisor);
			var y = ~~self.scale(n, -1, 1, self.floor, self.ceiling);
			if (y === self.floor || chunkY < y && y < chunkY + width) {
				var xidx = Math.abs((width + x % width) % width);
				var yidx = Math.abs((width + y % width) % width);
				var zidx = Math.abs((width + z % width) % width);
				var idx = xidx + yidx * width + zidx * width * width;
				voxels[idx] = 1;//self.generateVoxel(x,0,z,32);;
				// now that we've set the crust, loop down and create earth underneath
				for (var i = y; i >= chunkY; i--) {
				let idx = xidx + Math.abs((width + i % width) % width) * width + zidx * width * width;
				voxels[idx] = [materialsMap.grass,materialsMap.dirt,materialsMap.stone][getRandomInt(0, 3)] ;//self.generateVoxel(x,i,z,32)
			}
		}
	});
}

	pointsInside(chunkX: number, chunkY: number, width: number, func: any) {
		for (var x = chunkX; x < chunkX + width; x++) {
			for (var y = chunkY; y < chunkY + width; y++) {
				func(x, y);
			}
		}
	}

	scale(x: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
		return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
	}
}
