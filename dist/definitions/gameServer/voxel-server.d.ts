/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class voxelServer extends EventEmitter {
    updateDelay: number;
    nbUpdate: number;
    settings: any;
    game: any;
    chunkCache: any;
    forwardEvents: any[];
    clients: any;
    constructor(opts: any);
    initialize(opts: any): void;
    connectClient(connection: any): void;
    removeClient(duplexStream: any): void;
    bindClientEvents(client: any): void;
    broadcast(id: any, ...args: any[]): void;
    sendUpdate(): void;
    sendInitialChunks(connection: any): void;
    handleErrors(func: any): () => any;
}
