/// <reference types="mongoose" />
import * as Mongoose from "mongoose";
export interface IUser extends Mongoose.Document {
    name: string;
    email: string;
    source: string;
    socialId?: string;
    password?: string;
    createdAt?: Date;
    updateAt?: Date;
    validatePassword?(requestPassword: any): boolean;
}
export declare const UserSchema: Mongoose.Schema;
export declare const UserModel: Mongoose.Model<IUser>;
