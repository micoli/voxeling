import * as Hapi from "hapi";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";
export default class UserController {
    private database;
    private configs;
    constructor(configs: IServerConfigurations, database: IDatabase);
    private generateToken(user);
    loginUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    createUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    updateUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    deleteUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
    infoUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<void>;
    twitterRegister(request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response>;
}
