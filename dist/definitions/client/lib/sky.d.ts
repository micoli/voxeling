import { Sun } from './models/sun';
export declare class Weather {
    sunRotation: number;
    sun: Sun;
    directionalLight: {
        color: any;
        start: any;
        position: any;
    };
    ambientLightTypes: {
        dark: any;
        dawn: any;
        full: any;
        dusk: any;
    };
    lightTypes: {
        dark: any;
        dawn: any;
        full: any;
        dusk: any;
    };
    ambientLightColor: any;
    ambientLightAdjustment: any;
    ambientLight: any;
    lightAdjustment: any;
    light: any;
    time: number;
    textures: any;
    shader: any;
    gl: any;
    constructor(gl: any, shader: any, textures: any, player: any);
    setLight(seconds: number): void;
    tick(seconds: number): void;
    render(projection: any, ts: number): void;
}
