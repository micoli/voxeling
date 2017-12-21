/// <reference types="node" />
import { EventEmitter } from 'events';
import { Game } from '../../shared/voxel-engine-stackgl';
export declare class VoxelClient extends EventEmitter {
    opts: any;
    playerID: any;
    game: Game;
    texturePath: any;
    playerTexture: any;
    lerpPercent: any;
    remoteClients: any;
    serverStream: any;
    connection: any;
    serverSettingBlock: any;
    avatar: any;
    name: any;
    constructor(game: Game, opts: any);
    bindEvents(connection: any): void;
    enable(): void;
    disable(): void;
    initGame(settings: any): Game;
    onServerUpdate(update: any): void;
    lerpMe(position: any): void;
    updatePlayerPosition(id: any, update: any): void;
}
