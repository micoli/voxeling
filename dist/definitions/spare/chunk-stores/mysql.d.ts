import { ChunkStore } from '../chunk-store';
export declare class MysqlChunkStore extends ChunkStore {
    emitter: any;
    mysqlPool: any;
    requested: any;
    changes: any;
    toSave: any;
    constructor(generator: any, config: any);
    get(chunkID: any): void;
    gotChunkChanges(chunks: any): void;
    applyChanges(): void;
    save(): void;
    saveVoxels(chunkID: any, chunk: any): void;
}
