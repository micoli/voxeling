export declare class Physics {
    previousVelocity: any;
    rotatedMovementVector: any;
    rotationQuat: any;
    currentVelocity: any;
    game: any;
    movable: any;
    controlState: any;
    constructor(movable: any, controlState: any, game: any);
    tick(): void;
    handleCollision(movementVector: any): void;
    haggle(bounds: any, start: any, direction: any): boolean;
}
