export declare class WebGL {
    renderables: any[];
    shaders: {
        projectionViewPosition: any;
        projectionPosition: any;
    };
    renderCallback: (x: any) => void;
    gl: any;
    canvas: any;
    constructor(canvas: any);
    createShaders(): void;
    start(): void;
    render(ts: number): void;
    onRender(callback: any): void;
    addRenderable(obj: any): void;
}
