import * as Hapi from "hapi";
import { IDatabase } from "./database";
import { IServerConfigurations } from "./configurations";
export declare function init(configs: IServerConfigurations, database: IDatabase): Promise<Hapi.Server>;
