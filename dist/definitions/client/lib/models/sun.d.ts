export declare class Sun {
    tempSpeed: number;
    weatherTime: any;
    hierarchy: any;
    model: any;
    sun: any;
    sunRotation: number;
    constructor(gl: any, shader: any, textures: any, player: any);
    tick(weatherTime: any, sunRotation: any): void;
    render(parentView: any, ts: any): void;
}
