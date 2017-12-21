export declare class Game {
    currentVoxels: any;
    coordinates: any;
    config: any;
    updateNeedsCallback: any;
    frustum: any;
    player: any;
    lastRegion: number[];
    currentVoxel: any[];
    constructor(config: any, coordinates: any, player: any, regionChangeCallback: any);
    storeVoxels(chunk: any): void;
    positionChange(position: any): void;
    regionChange(playerPosition: any): void;
    getBlock(x: number, y: number, z: number): boolean | 1;
    setBlock(x: number, y: number, z: number, value: any, chunkVoxelIndexValue: any, touching: any): void;
    updateVoxelCache(changes: any): void;
    tick(): void;
    setPlayers(players: any): void;
}
