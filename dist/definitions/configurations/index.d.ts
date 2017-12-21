export interface IServerConfigurations {
    port: number;
    plugins: Array<string>;
    jwtSecret: string;
    jwtExpiration: string;
    routePrefix: string;
    social: ISocialDatasConfiguration;
}
export interface IDataConfiguration {
    connectionString: string;
}
export interface ISocialDataConfiguration {
    id: string;
    secret: string;
}
export interface ISocialDatasConfiguration {
    twitter: ISocialDataConfiguration;
}
export declare function getDatabaseConfig(): IDataConfiguration;
export declare function getServerConfigs(): IServerConfigurations;
