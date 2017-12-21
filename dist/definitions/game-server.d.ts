/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class GameServer extends EventEmitter {
    baseServer: any;
    game: any;
    settings: any;
    spatialTriggers: any[];
    connections: number;
    constructor(opts: any);
    connectClient(duplexStream: any): void;
    removeClient(duplexStream: any): void;
    initialize(opts: any): void;
    initWSServer(): void;
    bindEvents(): void;
    setupSpatialTriggers(): void;
}
