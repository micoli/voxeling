export declare class Lines {
    skipDraw: any;
    shaderProgram: any;
    pointOffsets: any[];
    color: any;
    points: any[];
    shaderAttributes: {
        position: any;
        shaderUniforms: {
            projection: any;
            color: any;
        };
    };
    shaderUniforms: {
        projection: any;
        color: any;
    };
    shaders: {
        fragment: any;
        vertex: any;
    };
    tuples: number;
    glBuffer: any;
    gl: any;
    constructor(gl: any, color?: any);
    fill(points: any): void;
    render(projection: any): void;
    skip(yesno: any): void;
}
