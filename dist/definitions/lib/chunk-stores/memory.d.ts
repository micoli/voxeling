import { ChunkStore } from '../chunk-store';
export declare class MemoryChunkStore extends ChunkStore {
    chunkCache: any;
    constructor(generator: any);
    get(chunkID: any): void;
    gotChunkChanges(chunks: any): void;
}
