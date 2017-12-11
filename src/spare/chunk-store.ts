var EventEmitter = require('events').EventEmitter;

// callback should match function(error, chunk)
export class ChunkStore {
	generator: any;
	emitter: any;

	constructor(generator: any) {
		this.emitter = new EventEmitter();
		this.generator = generator;
	}

	// Asyncronous
	public get(chunkID: any) {
	}

	public tick() {
		// Extend this class and do stuff
	}

	/*
	Base chunk store should probably not do anything
	Memory store should update memroy
	File/database store should likely update memory first,
	and then async flush to disk to avoid race conditions.
	So file store needs some sort of in-memory, maybe LRU, layer as well.
	*/
	public gotChunkChanges(chunks: any) {
		// Can't do much since this chunk store doesn't store any chunks
	}
}
