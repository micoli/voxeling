import {Generator} from '../generator';

var debug = false;

export class ClientGenerator extends Generator {
	emitter: any;
	chunksToGeneratePerPass: number;
	chunksToRequest: {};
	constructor(cache: any, chunkSize: number) {
		super(chunkSize);
		this.chunksToRequest = {};
		this.chunksToGeneratePerPass = 500;
	}


	setEmitter(emitter: any) {
		this.emitter = emitter;
	}

	requestChunk(chunkID: any) {
		this.chunksToRequest[chunkID] = true;
	}

	generateChunks() {
		var chunkIDs = Object.keys(this.chunksToRequest);
		if (chunkIDs.length === 0) {
			return;
		}
		if (debug) {
			console.log('generateChunks');
		}
		this.emitter.emit('needChunks', chunkIDs);
		this.chunksToRequest = {};
	}
}
