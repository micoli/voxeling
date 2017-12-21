export declare class VoxelingClient {
    receivedChunks: any[];
    camera: any;
    game: any;
    connected: boolean;
    emitter: any;
    players: any;
    avatar: string;
    voxels: any;
    player: any;
    id: any;
    server: any;
    settings: any;
    worker: any;
    constructor(settings: any);
    bindEvents(): void;
    regionChange(): void;
    otherSetup(): void;
    on(name: any, callback: any): void;
}
