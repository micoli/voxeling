/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Game extends EventEmitter {
    cubeSize: number;
    startingPosition: any;
    worldOrigin: any;
    buttons: any;
    frameUpdated: boolean;
    interval: any;
    view: any;
    chunkPad: any;
    generateVoxelChunk: any;
    generate: any;
    controls: any;
    controlling: any;
    reportedNotCapable: any;
    width: any;
    height: any;
    container: any;
    materials: any;
    scene: any;
    cameraPlugin: any;
    mesherPlugin: any;
    stitcher: any;
    pendingChunks: any[];
    chunksNeedsUpdate: any;
    asyncChunkGeneration: boolean;
    voxelRegion: any;
    chunkSize: any;
    chunkRegion: any;
    region: any;
    spatial: any;
    timer: any;
    paused: boolean;
    collideVoxels: any;
    shell: any;
    voxels: any;
    items: any[];
    meshType: any;
    playerHeight: any;
    antialias: any;
    skyColor: any;
    removeDistance: any;
    chunkDistance: any;
    arrayType: any;
    vector: any;
    isClient: boolean;
    generateChunks: any;
    gravity: number[];
    friction: number;
    epilson: number;
    terminalVelocity: number[];
    defaultButtons: any;
    settings: any;
    THREE: any;
    constructor(opts: any);
    getArrayType(arrayTypeSize: any): any;
    toString(): string;
    voxelPosition(gamePosition: any): number[];
    cameraPosition(): any[];
    cameraVector(): any;
    makePhysical(target: any, envelope: any, blocksCreation: any): any;
    addItem(item: any): any;
    removeItem(item: any): void;
    raycast(start: any, direction: any, maxDistance: any, epilson?: any): any;
    raycastVoxels(start: any, direction: any, maxDistance: any, epilson?: any): any;
    canCreateBlock(pos: any): boolean;
    createBlock(pos: any, val: any): boolean;
    setBlock(pos: any, val: any): void;
    getBlock(pos: any): any;
    blockPosition(pos: any): number[];
    blocks(low: any, high: any, iterator: any): {
        voxels: any;
        dims: number[];
    };
    createAdjacent(hit: any, val: any): void;
    appendTo(element: any): void;
    parseVectorArguments(args: any): any;
    setConfigurablePositions(opts: any): void;
    createContainer(opts: any): any;
    setDimensions(opts: any): void;
    webGlCapable(): boolean;
    notCapable(): boolean;
    notCapableMessage(): HTMLDivElement;
    control(target: any): any;
    potentialCollisionSet(): {
        collide: any;
    }[];
    /**
     * Get the position of the player under control.
     * If there is no player under control, return
     * current position of the game's camera.
     *
     * @return {Array} an [x, y, z] tuple
     */
    playerPosition(): any[];
    playerAABB(position: any): any;
    collideTerrain(other: any, bbox: any, vec: any, resting: any): void;
    configureChunkLoading(opts: any): void;
    worldWidth(): number;
    chunkToWorld(pos: any): number[];
    removeFarChunks(playerPosition?: any): void;
    addChunkToNextUpdate(chunk: any): void;
    updateDirtyChunks(): void;
    loadPendingChunks(count?: any): void;
    getChunkAtPosition(pos: any): any;
    showAllChunks(): void;
    showChunk(chunk: any, optionalPosition?: any): any;
    addMarker(position: any): void;
    addAABBMarker(aabb: any, color: any): void;
    addVoxelMarker(x: any, y: any, z: any, color: any): void;
    onFire(state: any): void;
    setInterval(): any;
    setTimeout(): any;
    tick(delta: any): void;
    render(delta: any): void;
    initializeTimer(rate: any): any;
    proxyButtons(): void;
    initializeControls(opts: any): void;
    hookupControls(buttons: any, opts: any): void;
    handleChunkGeneration(): void;
    destroy(): void;
}
