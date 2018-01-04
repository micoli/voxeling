var debug = false;

export abstract class Generator {
	chunkArraySize: number;
	chunkSize: any;

	constructor(chunkSize: any) {
		if (!chunkSize) {
			throw Error('Voxel-generator: chunkSize is required');
		}

		this.chunkSize = chunkSize;
		this.chunkArraySize = this.chunkSize * this.chunkSize * this.chunkSize;
	}

	// Default is a flat world
	generateVoxel (x: number, y: number, z: number, chunkSize: number):number {
		if (y < 1) {
			return 1; // grass and dirt
		}
		return 0;
	}

	getRelativePos(absolutePos:number[],offset:number[]=[0,0,0]){ //[x,y,z]
		this.chunkSize=32;
		var res:any={};
		res.pos = absolutePos;
		res.chunkX = Math.floor(absolutePos[0]/this.chunkSize)-offset[0];
		res.chunkY = Math.floor(absolutePos[1]/this.chunkSize)-offset[1];
		res.chunkZ = Math.floor(absolutePos[2]/this.chunkSize)-offset[2];
		res.offsetX =Math.floor(absolutePos[0]%this.chunkSize);
		res.offsetY =Math.floor(absolutePos[1]%this.chunkSize);
		res.offsetZ =Math.floor(absolutePos[2]%this.chunkSize);
		if(res.offsetX<0){
			res.offsetX=this.chunkSize+res.offsetX;
		}
		if(res.offsetY<0){
			res.offsetY=this.chunkSize+res.offsetY;
		}
		if(res.offsetZ<0){
			res.offsetZ=this.chunkSize+res.offsetZ;
		}
		res.chunkID=[res.chunkX,res.chunkY,res.chunkZ].join('|');
		return res;
	}

	get(chunkID: any) {
		if (debug) {
			console.log('Generator:generateChunk ' + chunkID);
		}
		var started = Date.now();
		var chunk = this.makeChunkStruct(chunkID);
		this.fillChunkVoxels(chunk, this.generateVoxel, this.chunkSize);
		//stats('generateChunk', started);
		return chunk;
	}


	// TODO: this needs to be accessible outside an instance, right?
	fillChunkVoxels(chunk: any, fn: any, chunkSize: number) {
		var lo = chunk.position;
		var ii = lo[0] + chunkSize;
		var jj = lo[1] + chunkSize;
		var kk = lo[2] + chunkSize;
		var index = 0;

		for (var k = lo[2]; k < kk; k++) {
			for (var j = lo[1]; j < jj; j++) {
				for (var i = lo[0]; i < ii; i++ , index++) {
					chunk.voxels[index] = fn(i, j, k, chunkSize);
				}
			}
		}
	}

	makeChunkStruct(chunkID: any) {
		var position = chunkID.split('|').map(function(value: any) {
			return Number(value);
		});
		return {
			position: position,
			chunkID: chunkID,
			voxels: new Uint8Array(this.chunkArraySize)
		};
	}

	dumpVoxels(ndvoxels:any,width:number,height:number,y:number){
		let row:string='';
		let er:any='';
		for (let zz=0;zz<height;zz++){
			row+=zz%10+" ";
		}
		console.log(row+'Z')
		console.log(er.padStart(65,"- ")+'  X');
		for (let xx=0;xx<height;xx++){
			row="";
			for (let zz=0;zz<height;zz++){
				let c=ndvoxels.get(xx,y,zz)
				if(c){
					row+=(c==13)?'. ':'x ';
				}else{
					row+='  ';
				}
			}
			console.log(row+" | "+xx)
		}
		console.log(er.padStart(65,"- "));
	}

}
