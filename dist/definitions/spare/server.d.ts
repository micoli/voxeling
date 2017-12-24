export interface IClient {
    id: any;
    lastSeen: number;
    connected: boolean;
    connection: any;
    avatar: string;
    position: any;
    yaw: number;
    pitch: number;
    requestedChunks: any;
    onlyTheseChunks: any[];
}
export declare class Server {
    encodedChunkCache: any;
    clients: any;
    chunksForClients: any;
    coords: any;
    emitter: any;
    lastWorldChunks: number[];
    requestedChunks: any;
    clientSettings: any;
    serverSettings: any;
    chunkStore: any;
    config: any;
    constructor(config: any, chunkStore: any, serverSettings: any, clientSettings: any);
    initialize(): void;
    connectClient(wseSocket: any): void;
    bindClientEvents(client: any): void;
    broadcast(id: any, event: any, data?: any): void;
    sendPlayers(): void;
    requestNearbyChunks(position: any): void;
    sendChunk(chunk: any): void;
    isChunkInBounds(chunkID: any): boolean;
    on(name: any, callback: any): void;
}
