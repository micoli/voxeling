import { Generator } from '../generator';
export declare class ClientGenerator extends Generator {
    emitter: any;
    chunksToGeneratePerPass: number;
    chunksToRequest: any;
    constructor(cache: any, chunkSize: number);
    setEmitter(emitter: any): void;
    requestChunk(chunkID: any): void;
    generateChunks(): void;
}
