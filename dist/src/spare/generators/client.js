"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = require("../generator");
var debug = false;
class ClientGenerator extends generator_1.Generator {
    constructor(cache, chunkSize) {
        super(chunkSize);
        this.chunksToRequest = {};
        this.chunksToRequest = {};
        this.chunksToGeneratePerPass = 500;
    }
    setEmitter(emitter) {
        this.emitter = emitter;
    }
    requestChunk(chunkID) {
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
exports.ClientGenerator = ClientGenerator;
