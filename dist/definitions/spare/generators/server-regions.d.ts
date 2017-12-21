import { Generator } from '../generator';
export declare class ServerRegionsGenerator extends Generator {
    chunkFolder: string;
    constructor(chunkSize: number, folder: string);
    fillChunkVoxels(chunk: any, fn: any, width: number): void;
}
