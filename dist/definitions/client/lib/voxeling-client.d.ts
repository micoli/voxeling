import { Camera } from './camera';
import { Game } from './game';
import { Voxels } from './voxels';
export declare class VoxelingClient {
    _camera: Camera;
    _game: Game;
    _voxels: Voxels;
    receivedChunks: any[];
    connected: boolean;
    emitter: any;
    players: any;
    avatar: string;
    player: any;
    id: any;
    server: any;
    settings: any;
    worker: any;
    constructor(settings: any);
    camera: Camera;
    game: Game;
    voxels: Voxels;
    bindEvents(): void;
    regionChange(): void;
    otherSetup(): void;
    on(name: any, callback: any): void;
}
