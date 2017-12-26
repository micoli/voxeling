
import { VoxelStats } from '../voxel-stats';
import { ChunkStore } from '../chunk-store';
import { LRU } from '../lru';

var fs = require('fs');
var concur = require('../min-concurrent');

var cache = new LRU(200);
var debug = false;

if (debug) {
	cache.on('evict', function(data: any) {
		console.log('evicted: ' + data.value.chunkID);
	});
}

/*
Note: with our current setup, there's a very small chance we could lose data due to race conditions

# User1 requests ChunkA that we need to generate
# ChunkA is generated and added to toSave
# User1 makes a change to ChunkA, somehow before it has been saved to disk. We save every 3 seconds, so maybe a node.js hiccup?
# ChunkA is evicted from lru cache due to pressure from requests for other chunks
# User2 moves near and requests ChunkA
# ChunkA doesn't exist in cache, so is regenerated and added to toSave (squashing the previous changes)
# ChunkA is finally saved to disk, but doesn't reflect what User1 expects

*/

export class FileChunkStore extends ChunkStore {
	toSave: any = {};
	chunkFolder: any;

	constructor(generator: any, chunkFolder: any) {
		super(generator);
		var self = this;
		this.chunkFolder = chunkFolder;
		this.toSave = {};

		setInterval(
			function() {
				self.save();
			},
			// Save chunks every 3 seconds
			3000
		);
	}

	public get(chunkID: any) {
		var self = this;
		var chunk;
		var filename: any;
		var readCallback: any;
		chunk = cache.get(chunkID);
		if (!!chunk) {
			this.emitter.emit('got', chunk);
			return;
		}

		// Queue these up so we don't exhaust our file handle limit
		// wrap the call and callback to make sure we keep triggering calls until we've emptied our queue

		// Check filesystem
		filename = chunkID.replace(/\|/g, '.').replace(/-/g, 'n');
		if (debug) {
			console.log('FileChunkStore:get ' + chunkID);
		}
		readCallback = function(err: any, data: any) {
			if (err) {
				if (debug) {
					console.log('FileChunkStore:get chunk not found');
				}
				// File not found, generate it
				chunk = self.generator.get(chunkID);
				if (chunk) {
					cache.set(chunkID, chunk);
					self.toSave[chunkID] = chunk;
					self.emitter.emit('got', chunk);
				} else {
					console.log('no chunk?');
				// For some reason our generator didn't return a chunk
				}
				return;
			}
			if (debug) {
				console.log('Loaded ' + filename);
			}
			var position = chunkID.split('|').map(function(value: any) {
				return Number(value);
			});
			chunk = {
				position : position,
				chunkID : chunkID,
				// TODO: fix this hardcoded value
				voxels : new Uint8Array(data)
			};
			cache.set(chunkID, chunk);
			self.emitter.emit('got', chunk);
		};
		concur.operation(function() {
			fs.readFile(self.chunkFolder + filename, concur.callback(readCallback));
		});
	}

	// Update chunks if we have them in memory
	public gotChunkChanges(chunks: any) {
		var self = this;
		// No race conditions here for memory store, but database and file might be a different story
		for (var chunkID in chunks) {
			var chunk = cache.get(chunkID);
			if (!!chunk) {
				var details = chunks[chunkID];
				// This takes place in the server
				//delete self.encodedChunkCache[chunkID];
				for (var i = 0; i < details.length; i += 2) {
					var index = details[i];
					var val = details[i + 1];
					var old = chunk.voxels[index];
					chunk.voxels[index] = val;
					if (old) {
						if (val) {
							VoxelStats.count('blocks.changed');
						} else {
							VoxelStats.count('blocks.destroyed');
						}
					} else {
						VoxelStats.count('blocks.created');
					}

				}
				self.toSave[chunkID] = chunk;
			//self.emitter.emit('chunkChanged', chunkID);
			} else {
				// For some reason, chunk not found in this.chunkCache
			}
		}
	}

	// Call this on a timeout
	// Callback gets triggered on success or failure
	// Schedule the next timeout afterwards
	public save() {
		var self = this;
		// TODO: include saves in the same file handle queue as gets
		// is there an abstraction (npm module) to help with this?
		var op = function(filename: any, chunk: any, callbackClosure: any) {
			return function() {
				console.log(self.chunkFolder , filename);
				fs.writeFile(self.chunkFolder + filename, new Buffer(chunk.voxels), callbackClosure);
			};
		};
		var callbackClosure = function(chunkID: any) {
			return function(err: any) {
				if (err) {
					return console.log(err);
				}
				//console.log('Saved chunk ' + chunkID);
			};
		};
		for (var chunkID in this.toSave) {
			var filename = chunkID.replace(/\|/g, '.').replace(/-/g, 'n');
			var chunk = this.toSave[chunkID];
			if (chunk) {
				concur.operation(op(filename, chunk, concur.callback(callbackClosure(chunkID))));
			} else {
				console.log('Need to save chunk, but chunk was sent to us', chunkID);
			}
		}
		this.toSave = {};
	}
	public tick() {
	}
}
