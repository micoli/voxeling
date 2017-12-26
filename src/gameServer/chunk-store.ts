var EventEmitter = require('events').EventEmitter;

// callback should match function(error, chunk)
export abstract class ChunkStore {
	generator: any;
	emitter: any;

	constructor(generator: any) {
		this.emitter = new EventEmitter();
		this.generator = generator;
	}

	// Asyncronous
	public abstract get(chunkID: any):void;

	public abstract tick() :void;

	/*
	Base chunk store should probably not do anything
	Memory store should update memroy
	File/database store should likely update memory first,
	and then async flush to disk to avoid race conditions.
	So file store needs some sort of in-memory, maybe LRU, layer as well.
	// Can't do much since this chunk store doesn't store any chunks
	*/
	public abstract gotChunkChanges(chunks: any) :void;
}
