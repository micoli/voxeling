export declare class WebSocketEmitter {
    emitter: any;
    webSocket: any;
    isOpen: any;
    constructor(webSocket: any, emitter: any, isOpen: any);
    emit(name: any, callback: any): void;
    on(name: any, callback: any): void;
    close(): void;
}
export declare class Client {
    url: any;
    wse: any;
    emitter: any;
    constructor();
    connect(url: any): WebSocket;
    on(name: any, callback: any): void;
    emit(): void;
    close(): void;
}
export declare class Server {
    ws: any;
    emitter: any;
    constructor(opts: any);
    on(name: any, callback: any): void;
}
