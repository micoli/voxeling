import { Generator } from '../generator';
import { VoxelServer } from '../voxel-server';
//var noise = require('perlin').noise;
import materialsMap from './server-land-materials';
import { weightedRandomCorpusA } from '../weighted-random';
import OpenSimplexNoise from 'open-simplex-noise';
const seedrandom = require('seedrandom');
const ndarray = require('ndarray');

var debug = false;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

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
	treeRandomMax:number;
	treeSides:any[]=[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,2,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	];

	constructor(chunkSize: number,baseServer:VoxelServer) {
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
		if(chunkY<=self.bedrock-10){
			this.fillFullChunk(chunk,[materialsMap.air]);
			return ;
		}
		if(chunkY<=self.bedrock){
			this.fillFullChunk(chunk,[materialsMap.bedrock]);
			return ;
		}
		if(chunkY<=self.floor){
			this.fillFullChunk(chunk,this.randomUndercrust);
			return ;
		}
		if(chunkY>1){
			this.fillFullChunk(chunk,[materialsMap.air]);
			return ;
		}
		var ndvoxels = ndarray(voxels, [width , width , width ]);
		var ndsummit = ndarray(new Int8Array(width * width), [width , width ]);

		self.pointsInside(chunkX, chunkZ, width, function(globalX: number, globalZ: number,localX:number,localZ:number) {
			var y=Math.floor((
				(self.openSimplex.noise2D(globalX/self.divisor, globalZ/self.divisor) + 0.5) * 1
				//+(self.openSimplex.noise2D(globalZ/(self.divisor/2), globalX/(self.divisor/2)) + 0.5) * 0.5
			)*width);
			y=Math.max(Math.min(y,width),0);

			ndsummit.set(localZ,localX,y);
			for (var i = 0; i <width ;  i++) {
				if (i<=y){
					ndvoxels.set(localZ,i,localX,self.randomTerrain.pick());
				}else{
					ndvoxels.set(localZ,i,localX,0)
				}
			}
		});

		self.plantTrees(ndvoxels, ndsummit, width);

	}

	getRandomInt(min:number, max:number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	pointsInside(chunkX: number, chunkZ: number, width: number, func: any) {
		for (var x = 0; x < width ; x++) {
			for (var z = 0; z < width ; z++) {
				func(chunkX*width+x,chunkZ*width+z,x, z);
			}
		}
	}

	plantTrees(ndvoxels:any, ndsummit:any, width:number){
		var self=this;
		var trunkOffset=(self.treeSides.length-1)/2;
		for(let i=0;i<=3;i++){
			var x:number,z:number;
			[x,z]=[this.getRandomInt(0,width-trunkOffset*2)+trunkOffset,self.getRandomInt(0,width-trunkOffset*2)+trunkOffset]
			var basey=ndsummit.get(x,z);
			var treeHeight=self.getRandomInt(4,7);
			var leavesHeight=self.getRandomInt(2,4);
			if(basey<=(width-treeHeight-leavesHeight)){
				for(let l=1;l<=(treeHeight+leavesHeight);l++){
					ndvoxels.set(x,basey+l,z,materialsMap.plankOak);
				}
				for(let l=treeHeight;l<=(treeHeight+leavesHeight);l++){
					self.treeSides.forEach(function(line,px:number){
						line.forEach(function(cell:any,pz:number){
							if(self.getRandomInt(0,10)<=cell){
								ndvoxels.set(x+px-trunkOffset,basey+l,z+pz-trunkOffset,materialsMap.leavesOak);
							}
						})
					});
				}
			}
		}
	}
}
