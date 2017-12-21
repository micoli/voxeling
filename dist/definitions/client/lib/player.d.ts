import { Movable } from './movable';
export declare class Player extends Movable {
    model: any;
    eyePosition: any;
    eyeOffset: any;
    isMoving: boolean;
    constructor(gl: any, shader: any, texture: any);
    translate(vector: any): void;
    setTranslation(x: number, y: number, z: number): void;
    getEyeOffset(): any;
    getEyePosition(): any;
    setTexture(texture: any): void;
    render(projection: any, ts: any): void;
}
