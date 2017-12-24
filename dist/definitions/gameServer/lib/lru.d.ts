/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class LRU extends EventEmitter {
    debug: boolean;
    maxAge: any;
    max: any;
    length: number;
    oldest: any;
    newest: any;
    cache: any;
    constructor(opts: any);
    remove(key: any): any;
    peek(key: any): any;
    set(key: any, value: any): any;
    get(key: any): any;
    evict(): void;
}
