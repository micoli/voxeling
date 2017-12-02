import * as Mongoose from "mongoose";

export interface IGame extends Mongoose.Document {
  userId: string;
  name: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updateAt: Date;
}

export const GameSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  completed: Boolean
}, {
    timestamps: true
  });

export const GameModel = Mongoose.model<IGame>('Game', GameSchema);