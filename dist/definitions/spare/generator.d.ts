export declare class Generator {
    chunkArraySize: number;
    chunkSize: any;
    constructor(chunkSize: any);
    generateVoxel(x: number, y: number, z: number, chunkSize: number): number;
    get(chunkID: any): {
        position: any;
        chunkID: any;
        voxels: Uint8Array;
    };
    fillChunkVoxels(chunk: any, fn: any, chunkSize: number): void;
    makeChunkStruct(chunkID: any): {
        position: any;
        chunkID: any;
        voxels: Uint8Array;
    };
}
