// eslint-disable-next-line no-unused-vars
import mongoose, { Schema, Document, Model, Types, model } from "mongoose"

export interface IUserDocument extends Document {
    email: string;
    fullname: string;
    password: string;
    tokens: {
        access: string;
        token: string;
    }[];
}

export interface IUser extends IUserDocument {
    // methods here! 
    toJSON(): { _id: Types.ObjectId, email: string }
    generateAuthToken(): any
}

export interface IUserModel extends Model<IUser> {
    // statics here
    removeAuthToken(token: any): any
    findByCredentials(email: string, password: string): any
    accountExists(email: string): any
    findByToken(token: any): any
}
