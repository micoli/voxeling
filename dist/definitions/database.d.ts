/// <reference types="mongoose" />
import * as Mongoose from "mongoose";
import { IDataConfiguration } from "./configurations";
import { IUser } from "./users/user";
import { IGame } from "./games/game";
export interface IDatabase {
    userModel: Mongoose.Model<IUser>;
    gameModel: Mongoose.Model<IGame>;
}
export declare function init(config: IDataConfiguration): IDatabase;
