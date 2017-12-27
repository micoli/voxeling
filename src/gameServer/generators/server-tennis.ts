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
	}
}
