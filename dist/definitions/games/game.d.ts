/// <reference types="mongoose" />
import * as Mongoose from "mongoose";
export interface IGame extends Mongoose.Document {
    userId: string;
    name: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    updateAt: Date;
}
export declare const GameSchema: Mongoose.Schema;
export declare const GameModel: Mongoose.Model<IGame>;
