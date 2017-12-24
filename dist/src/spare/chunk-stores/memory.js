"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voxel_stats_1 = require("../voxel-stats");
const chunk_store_1 = require("../chunk-store");
// Stores chunks in an object, keyed by chunkID
class MemoryChunkStore extends chunk_store_1.ChunkStore {
    constructor(generator) {
        super(generator);
        this.chunkCache = {};
        this.chunkCache = {};
    }
    get(chunkID) {
        var chunk;
        if (chunkID in this.chunkCache) {
            this.emitter.emit('got', this.chunkCache[chunkID]);
            return;
        }
        chunk = this.generator.get(chunkID);
        if (chunk) {
            this.chunkCache[chunkID] = chunk;
            this.emitter.emit('got', chunk);
        }
        else {
            // For some reason our generator didn't return a chunk
        }
    }
    // Update chunks if we have them in memory
    gotChunkChanges(chunks) {
        var self = this;
        // No race conditions here for memory store, but database and file might be a different story
        for (var chunkID in chunks) {
            if (chunkID in self.chunkCache) {
                var chunk = self.chunkCache[chunkID];
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
                            voxel_stats_1.VoxelStats.count('blocks.changed');
                        }
                        else {
                            voxel_stats_1.VoxelStats.count('blocks.destroyed');
                        }
                    }
                    else {
                        voxel_stats_1.VoxelStats.count('blocks.created');
                    }
                }
                //self.emitter.emit('chunkChanged', chunkID);
            }
            else {
                // For some reason, chunk not found in this.chunkCache
            }
        }
    }
}
exports.MemoryChunkStore = MemoryChunkStore;
