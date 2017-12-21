import * as Hapi from "hapi";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";
export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: IDatabase): void;
