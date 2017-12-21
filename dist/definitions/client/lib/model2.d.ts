export declare class Model2 {
    texture: any;
    worldMatrix: any;
    localMatrix: any;
    _tick: any;
    meshes: any;
    shader: any;
    gl: any;
    num: number;
    constructor(gl: any, shader: any, meshes: any, tick: any);
    initMeshes(): void;
    setTexture(texture: any): void;
    tick(parentWorldMatrix: any): void;
    render(ts: any): void;
}
