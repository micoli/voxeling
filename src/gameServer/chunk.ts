import * as Mongoose from "mongoose";

export interface IChunk extends Mongoose.Document {
	world : string;
	x: number;
	y: number;
	z: number;
	chunk: string;
	createdAt?: Date;
	updateAt?: Date;
}

export const ChunkSchema = new Mongoose.Schema({
	world: {type: String, required: true},
	x: {type: Number, required: true},
	y: {type: Number, required: true},
	z: {type: Number, required: true},
	chunk: {type: String, required: true}
}, {
	timestamps: true
});

ChunkSchema.pre('save', function(next) {
	const chunk = this;
	return next();
});

ChunkSchema.pre('findOneAndUpdate', function() {
	/*if (false) {
		return;
	}*/

	//this.findOneAndUpdate({}, {});
});

export const ChunkModel = Mongoose.model<IChunk>('Chunk', ChunkSchema);
