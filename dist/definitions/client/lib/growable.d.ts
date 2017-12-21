export declare class Growable {
    offset: number;
    data: any;
    size: any;
    type: any;
    constructor(_type: any, initialSize: any);
    need(size: any): any;
    append(arr: any): void;
    free(): void;
}
