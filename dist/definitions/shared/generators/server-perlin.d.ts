import { Generator } from '../generator';
export declare class ServerPerlinGenerator extends Generator {
    constructor(chunkSize: number);
    generateVoxel(x: number, y: number, z: number, chunkSize: number): number;
    fillChunkVoxels(chunk: any, fn: any, width: number): void;
}
