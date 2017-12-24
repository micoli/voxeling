/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Game extends EventEmitter {
    interact: any;
    regionChangeCallback: any;
    currentVoxels: any;
    coordinates: any;
    config: any;
    updateNeedsCallback: any;
    frustum: any;
    isClient: boolean;
    player: any;
    lastRegion: number[];
    currentVoxel: any[];
    constructor(config: any, coordinates: any, player: any, regionChangeCallback: any);
    storeVoxels(chunk: any): void;
    nearbyChunks(chunks: any): void;
    positionChange(position: any): void;
    getBlock(x: number, y: number, z: number): boolean | 1;
    setBlock(pos: number[], value: any, chunkVoxelIndexValue: any, touching?: any): void;
    updateVoxelCache(changes: any): void;
    tick(): void;
    setPlayers(players: any): void;
}
