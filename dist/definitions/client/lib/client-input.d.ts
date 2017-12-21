export declare class InputHandler {
    boundStates: any;
    state: {
        select: boolean;
        alt: boolean;
        forward: number;
        backward: number;
        left: number;
        right: number;
        jump: boolean;
        fly: boolean;
        fire: boolean;
        firealt: boolean;
    };
    emitter: any;
    canvas: any;
    bindToElement: any;
    fired: boolean;
    constructor(bindToElement: any, canvas: any);
    mouseDeltaCallback(callback: any): void;
    transition(newState: any): void;
    tick(): void;
    on(name: any, callback: any): void;
}
