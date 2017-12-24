declare var WebSocket: any;
declare var EventEmitter: any;
declare var slice: (start?: number, end?: number) => any[];
declare var log: any;
declare function WebSocketEmitter(webSocket: any, emitter: any): void;
declare function Client(): void;
declare function Server(opts: any): void;
