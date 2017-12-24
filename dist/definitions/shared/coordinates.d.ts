export declare class Coordinates {
    chunkSize: number;
    chunkMask: any;
    voxelMask: any;
    constructor(chunkSize: number);
    nearbyChunkIDsEach(position: any, maxDistance: number, callback: any): void;
    coordinatesToChunkID(x: number, y: number, z: number): string;
    positionToChunk(position: any): number[];
    coordinatesToChunk(x: number, y: number, z: number): number[];
    positionToChunkID(position: any): string;
    coordinatesToVoxelIndex(x: number, y: number, z: number, touching?: any): number;
    coordinatesToChunkAndVoxelIndex(x: number, y: number, z: number, touching: any): (string | number)[];
    positionToVoxelIndex(pos: any): number;
    lowToHighEach(low: any, high: any, callback: any): void;
}
