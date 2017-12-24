import * as Hapi from "hapi";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";
export default class GameController {
    private database;
    private configs;
    constructor(configs: IServerConfigurations, database: IDatabase);
    createGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    updateGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    deleteGame(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    getGameById(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<void>;
    getGames(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
}
