/// <reference types="node" />
import { EventEmitter } from 'events';
import { Game } from '../shared/voxel-engine-stackgl';
export declare class GameServer extends EventEmitter {
    mysqlPool: any;
    clientSettings: {
        initialPosition: any;
    };
    settings: any;
    chunkCache: any;
    forwardEvents: any;
    game: Game;
    clients: any;
    connections: number;
    constructor(opts: any);
    initWSServer(): void;
    createGame(): void;
    connectClient(connection: any, id: any): void;
    removeClient(id: any): void;
    bindClientEvents(client: any): void;
    broadcast(id: any, ...event: any[]): void;
    sendUpdate(): void;
    sendInitialChunks(connection: any): void;
    getCachedChunk(chunk: any): any;
    getChunkId(pos: any): any;
    emitChunk(connection: any, chunk: any): void;
    handleErrors(func: any): () => any;
}
