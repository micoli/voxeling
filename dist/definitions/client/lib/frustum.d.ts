export declare class Frustum {
    satProjections: any;
    points: any[];
    coordinates: any[];
    farWidth: number;
    farHeight: number;
    nearWidth: number;
    nearHeight: number;
    constructor(verticalFieldOfView: any, ratio: any, nearDistance: number, farDistance: number);
    update(position: any, rotationQuat: any): void;
    private project(axis, points);
    private overlap(a, b0, b1);
    private separatingAxisTheorum(chunkProjections, points);
    visible(chunkID: any): boolean;
    chunkVisible(chunkID: any, position: any): boolean;
}
