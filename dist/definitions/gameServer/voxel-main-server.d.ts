/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class voxelServer extends EventEmitter {
    settings: any;
    game: any;
    chunkCache: any;
    forwardEvents: any[];
    clients: any;
    constructor(opts: any);
    initialize(opts: any): void;
    connectClient(duplexStream: any): void;
    removeClient(duplexStream: any): void;
    bindClientEvents(client: any): void;
    broadcast(id: any, ...args: any[]): void;
    sendUpdate(): void;
    sendInitialChunks(connection: any): void;
    getFlatChunkVoxels(position: any): any;
    handleErrors(func: any): () => any;
}
