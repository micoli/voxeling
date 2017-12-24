export declare class Movable {
    bounds: {
        bottomFrontLeft: number[];
        bottomFrontRight: number[];
        bottomBackLeft: number[];
        bottomBackRight: number[];
        middleFrontLeft: number[];
        middleFrontRight: number[];
        middleBackLeft: number[];
        middleBackRight: number[];
        topFrontLeft: number[];
        topFrontRight: number[];
        topBackLeft: number[];
        topBackRight: number[];
        all: any;
        front: any;
        back: any;
        left: any;
        right: any;
        top: any;
        bottom: any;
    };
    position: any;
    rotationQuatNeedsUpdate: boolean;
    rotationQuat: any;
    bank: number;
    pitch: number;
    yaw: number;
    isMoving: boolean;
    constructor();
    translate(vector: any): void;
    setTranslation(x: number, y: number, z: number): void;
    rotateY(radians: number): void;
    rotateX(radians: number): void;
    setRotation(x: number, y: number, z: number): void;
    getPosition(): any;
    getX(): any;
    getY(): any;
    getZ(): any;
    getPitch(): number;
    getYaw(): number;
    getRotationQuat(): any;
    getBank(): number;
    updateBounds(position: any): void;
}
