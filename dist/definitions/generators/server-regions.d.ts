declare var Generator: (chunkSize: any) => void;
declare var inherits: any;
declare var fs: any;
declare var noise: any;
declare var debug: boolean;
declare function ServerRegionsGenerator(cache: any, chunkSize: any, folder: any): void;
declare var perlin: (seed: any, floor: any, ceiling: any, divisor: any) => (chunk: any, width: any) => void;
declare var terrains: {
    high: (chunk: any, width: any) => void;
    rolling: (chunk: any, width: any) => void;
    'sea-level': (chunk: any, chunkSize: any) => void;
    ground: (chunk: any, chunkSize: any) => void;
    clouds: (chunk: any, chunkSize: any) => void;
};
