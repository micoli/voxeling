import { ChunkStore } from '../chunk-store';
export declare class FileChunkStore extends ChunkStore {
    toSave: any;
    chunkFolder: any;
    constructor(generator: any, chunkFolder: any);
    get(chunkID: any): void;
    gotChunkChanges(chunks: any): void;
    save(): void;
}
