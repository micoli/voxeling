/// <reference types="node" />
import { EventEmitter } from 'events';
import { Game } from '../shared/voxel-engine-stackgl';
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
    currentState: any;
    isReady: boolean;
    constructor(game: Game, opts: any);
    private scale(x, fromLow, fromHigh, toLow, toHigh);
    bindEvents(connection: any): void;
    enable(): void;
    disable(): void;
    initGame(settings: any): Game;
    sendState(): void;
    private getNormalizedState(player);
    onServerUpdate(update: any): void;
    lerpMe(position: any): void;
    updatePlayerPosition(id: any, update: any): void;
}
