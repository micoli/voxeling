import { Generator } from '../generator';
import { VoxelServer } from '../voxel-server';
//var noise = require('perlin').noise;
import materialsMap from './server-land-materials';
import { weightedRandomCorpusA,getRandomInt } from '../weighted-random';
import { BasicTreeGenerator } from './tree-generators/basic-tree';
import { SmallTreeGenerator } from './tree-generators/small-tree';
import { PineTreeGenerator } from './tree-generators/pine-tree';
import OpenSimplexNoise from 'open-simplex-noise';
const seedrandom = require('seedrandom');
const ndarray = require('ndarray');

var debug=false;

export class ServerLandGenerator extends Generator {
	baseServer:VoxelServer;
	bedrock:number = -10;
	floor:number = 0;
	ceiling:number = 20;
	divisor:number = 100;
	seed:any = 'hello';
	randomTerrain:any;
	randomUndercrust:any;
	openSimplex:OpenSimplexNoise;
	treeRandomMax:number=3;
	ndsummit:any={};

	constructor(chunkSize: number,baseServer:any) {
		super(chunkSize);
		this.baseServer = baseServer;
		this.openSimplex = new OpenSimplexNoise(seedrandom(this.seed))

		var tmp:any;
		tmp={};
		tmp[materialsMap.grass] = 15;
		tmp[materialsMap.dirt] = 3;
		tmp[materialsMap.stone]= 1;
		this.randomTerrain = new weightedRandomCorpusA(tmp);

		tmp={};
		tmp[materialsMap.grass] = 5;
		tmp[materialsMap.bedrock] = 1;
		this.randomUndercrust = new weightedRandomCorpusA(tmp);
	}

	generateVoxel(x: number, y: number, z: number, chunkSize: number): number {
		if (y === 0) {
			return 1;
		}
		return 0;
	}

	fillFullChunk(chunk:any,materials:any){
		for (var i = 0; i < 32768; i++) {
			chunk.voxels[i]=Array.isArray(materials)?materials[getRandomInt(0,materials.length-1)]:materials.pick();
		}
	}

	fillChunkVoxels (chunk: any, fn: any, width: number) {
		var self = this;
		var position = chunk.position;
		var chunkX = position[0];
		var chunkY = position[1];
		var chunkZ = position[2];
		var voxels = chunk.voxels;

		let maxChunkHeight = 2

		if(chunkY<=self.bedrock-10){
			this.fillFullChunk(chunk,[materialsMap.air]);
			return ;
		}
		if(chunkY<=self.bedrock){
			this.fillFullChunk(chunk,[materialsMap.bedrock]);
			return ;
		}
		if(chunkY<self.floor){
			this.fillFullChunk(chunk,this.randomUndercrust);
			return ;
		}
		/*if(chunkY>maxChunkHeight){
			this.fillFullChunk(chunk,[materialsMap.air]);
			return ;
		}*/
		let stat=[0,0];
		var ndvoxels = ndarray(voxels, [width , width , width ]);
		let xzKey=chunkX+'-'+chunkZ;
		if (!self.ndsummit[xzKey]){
			self.ndsummit[xzKey]=ndarray(new Int8Array(width * width), [width , width ]);
			self.pointsInside(chunkX, chunkZ, width, function(globalX: number, globalZ: number,localX:number,localZ:number) {
				var y=Math.floor((
					((self.openSimplex.noise2D(globalX/self.divisor, globalZ/self.divisor) + 1.1) * 0.9)/2
				)* width * maxChunkHeight );
				self.ndsummit[xzKey].set(localZ,localX, y /* * (self.openSimplex.noise2D(chunkX*width/self.divisor, chunkZ*width/self.divisor)+1) */);
			});
		}
		self.pointsInside(chunkX, chunkZ, width, function(globalX: number, globalZ: number,localX:number,localZ:number) {
			for (var i = chunkY*width; i <chunkY*width+width ;  i++) {
				if (i<=self.ndsummit[xzKey].get(localZ,localX)){
					ndvoxels.set(localZ,i-chunkY*width,localX,self.randomTerrain.pick());
				}else{
					ndvoxels.set(localZ,i-chunkY*width,localX,0)
				}
			}
		});
		self.plantTrees(chunkX, chunkY, chunkZ, ndvoxels, self.ndsummit[xzKey], width);

		if (debug) {
			console.log('stat',chunkX,chunkY,chunkZ,stat);
		}
	}

	pointsInside(chunkX: number, chunkZ: number, width: number, func: any) {
		for (var x = 0; x < width ; x++) {
			for (var z = 0; z < width ; z++) {
				func(chunkX*width+x,chunkZ*width+z,x, z);
			}
		}
	}

	plantTrees(chunkX:number, chunkY:number,chunkZ:number, ndvoxels:any, ndsummit:any, width:number){
		var self=this;
		for(let i=0;i<=self.treeRandomMax;i++){
			var x:number,z:number;
			[x,z]=[
				Math.floor((self.openSimplex.noise2D(chunkX+i, chunkZ  ) + 1)*16),
				Math.floor((self.openSimplex.noise2D(chunkX  , chunkZ+i) + 1)*16)
			];
			let y = ndsummit.get(x,z);
			if ((chunkY+0)*width<=y && y <(chunkY+1)*width){
				PineTreeGenerator.generate(ndvoxels,width,x,y,z);
			}
		}
	}
}
