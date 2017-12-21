/// <reference types="jquery" />
declare var glm: any, vec3: any, vec4: any, mat4: any, quat: any;
declare var WebGL: any;
declare var Movable: any;
declare var Camera: any;
declare var Lines: any;
declare var Shapes: any;
declare var Model: any;
declare var pool: any;
declare var canvas: HTMLCanvasElement;
declare var webgl: any;
declare var player: any;
declare var camera: any;
declare var lines: any;
declare var parts: any[];
interface IMesh {
    vertices: any[];
    faces: any[];
    texcoord: any;
    rotation: any[];
    scale: number;
}
declare var mesh: IMesh;
declare var to: number;
declare var modelPosition: any;
declare var model: any;
declare var adjustment: number;
declare var $controls: JQuery<HTMLElement>;
