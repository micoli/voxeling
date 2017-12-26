import { Generator } from '../generator';
var debug = false;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export class ServerTennisGenerator extends Generator {
	constructor(chunkSize: number) {
		super(chunkSize);
		// 1 block rise, each ring of chunks out from center
	}

	generateVoxel(x:number, y:number, z:number, chunkSize:number):number {
		var material = 11;
		if (y > 0) {
			return 0;
		}

		if ((x == 0 || x == chunkSize-1 || z == 0 || z == chunkSize-1) && (y == 0 || y == chunkSize-1)) {
			return 37;
		} else if ( y == 0) {
			return  material;
		} else {
			return 0;
		}

		/*if (y < 0) {
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
		return 0;*/
	}
}
