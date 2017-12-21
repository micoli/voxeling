export declare class Node {
    worldMatrix: any;
    localMatrix: any;
    model: any;
    children: any[];
    gl: any;
    constructor(gl: any, model: any);
    addChild(node: any): void;
    tick(parentWorldMatrix: any, ts: number): void;
    render(ts: number): void;
}
