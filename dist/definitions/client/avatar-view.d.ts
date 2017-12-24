export interface avatarData {
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
}
export declare class avatarView {
    game: any;
    shaderPlugin: any;
    gl: any;
    skin: any;
    mesh: any;
    meshShader: any;
    dt: number;
    globalPosX: any;
    globalPosY: any;
    globalPosZ: any;
    globalYaw: any;
    globalPitch: any;
    u_Translation: any;
    onInit: any;
    onUpdatePerspective: any;
    onRender: any;
    isWalking: boolean;
    constructor(game: any);
    walk(): void;
    halt(): void;
    enable(): void;
    disable(): void;
    ginit(): void;
    updatePerspective(): void;
    update(data: any): void;
    render(): void;
}
