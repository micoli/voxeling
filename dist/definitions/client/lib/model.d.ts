export declare class Model {
    movable: any;
    shaderAttributes: {};
    texture: any;
    shaderUniforms: {};
    shaders: {};
    meshes: any;
    shader: any;
    gl: any;
    constructor(gl: any, shader: any, meshes: any, texture: any, movable: any);
    initMeshes(): void;
    setTexture(texture: any): void;
    render(matrix: any, ts: any): void;
}
