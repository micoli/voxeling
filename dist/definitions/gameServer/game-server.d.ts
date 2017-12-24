/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class GameServer extends EventEmitter {
    baseServer: any;
    game: any;
    settings: any;
    spatialTriggers: any[];
    connections: number;
    connectionLimit: number;
    constructor(opts: any);
    connectClient(duplexStream: any): void;
    removeClient(duplexStream: any): void;
    private initialize(opts);
    private bindEvents();
    private setupSpatialTriggers();
    getFlatChunkVoxels(position: any): any;
}
