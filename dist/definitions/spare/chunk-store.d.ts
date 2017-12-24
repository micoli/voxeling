export declare class ChunkStore {
    generator: any;
    emitter: any;
    constructor(generator: any);
    get(chunkID: any): void;
    tick(): void;
    gotChunkChanges(chunks: any): void;
}
