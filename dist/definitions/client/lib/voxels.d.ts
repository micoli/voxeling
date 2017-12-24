export declare class Voxels {
    farPending: boolean;
    farDistance: number;
    meshDistances: any;
    nearPending: boolean;
    farMeshes: any;
    nearMeshes: any;
    farBuffersByTexture: any;
    nearBuffersByTexture: any;
    releaseMeshCallback: any;
    shader: any;
    textures: any;
    gl: any;
    constructor(gl: any, shader: any, textures: any, releaseMeshCallback: any);
    showMesh(chunkId: any, mesh: any): void;
    meshesToShow(meshDistances: any): void;
    prepareMeshBuffers(near: any): void;
    render(projection: any, ts: number, ambientLight: any, directionalLight: any): void;
}
