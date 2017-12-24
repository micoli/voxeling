import { Movable } from './movable';
import { Player } from './player';
export declare class Camera extends Movable {
    view: number;
    shoulderOffset: number[];
    thirdPersonOffset: number[];
    ratio: any;
    protected _follow: Player;
    projection: any;
    farDistance: number;
    verticalFieldOfView: number;
    inverse: any;
    canvas: any;
    matrix: any;
    constructor(canvas: any, follow: any);
    follow: Player;
    canvasResized(): void;
    updateProjection(): any;
    nextView(): void;
}
