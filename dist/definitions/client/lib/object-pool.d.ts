declare var pool: any;
declare var bytes: number;
declare var mallocs: number;
declare var news: number;
declare var frees: number;
declare var create: (_type: any, size: any) => any[] | Uint8Array | Float32Array;
declare var getSize: (_type: any, o: any) => any;
