import { Generator } from '../generator';
//import { VoxelServer } from '../voxel-server';
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
	//baseServer:VoxelServer;
	baseServer:any;
	bedrock:number = -10;
	floor:number = 0;
	ceiling:number = 20;
	divisor:number = 80;
	seed:any = 'hello';
	randomTerrain:any;
	randomUndercrust:any;
	openSimplex:OpenSimplexNoise;
	treeRandomMax:number=3;
	grassRandomMax:number=10;
	waterRandomMax:number=22;
	ndsummit:any={};

	constructor(chunkSize: number,baseServer:any) {
		super(chunkSize);
		this.baseServer = baseServer;
		this.openSimplex = new OpenSimplexNoise(seedrandom(this.seed));
	;
		var tmp:any;
		tmp={};
		tmp[materialsMap.grass] = 15;
		tmp[materialsMap.grass] = 3;//dirt
		tmp[materialsMap.grass]= 1;//stone
		this.randomTerrain = new weightedRandomCorpusA(tmp);

		tmp={};
		tmp[materialsMap.grass] = 5;
		tmp[materialsMap.grass] = 1;//bedrock
		this.randomUndercrust = new weightedRandomCorpusA(tmp);
	}

	fullyFillChunk(chunk:any,materials:any){
		for (var i = 0; i < this.chunkSize*this.chunkSize*this.chunkSize; i++) {
			chunk.voxels[i]=Array.isArray(materials)?materials[getRandomInt(0,materials.length-1)]:materials.pick();
		}
	}

	fillChunkVoxels (chunk: any, fn: any, width: number) {
		var self = this;
		var position = chunk.position;
		var chunkX = position[0];
		var chunkY = position[1];
		var chunkZ = position[2];

		let maxChunkHeight = 2

		let stat = {min:10000,max:-10000};
		var ndvoxels = ndarray(chunk.voxels, [width , width , width ]);

		let xzKey=[chunkX,0,chunkZ].join('|');
		if (!self.ndsummit[xzKey]){
			self.ndsummit[xzKey] = ndarray(new Int8Array(width * width), [width , width ]);

			self.pointsInside(chunkX, chunkZ, width, function(globalX: number, globalZ: number,localX:number,localZ:number) {
				let y=(self.openSimplex.noise2D(globalX/self.divisor, globalZ/self.divisor) + 1.1) * 0.9 / 2;
				//y = Math.sin((3.14/2)*Math.pow(y,5));
				//y = 0.8*Math.pow(y-0.2,0.6)+0.3;  _/-
				//y = 2.1*Math.pow(y-0.4,2.2)+0.27; /-/
				stat.min = Math.min(stat.min,y);
				stat.max = Math.max(stat.max,y);;

				self.ndsummit[xzKey].set(localZ,localX, Math.floor(y * width * maxChunkHeight)); /* * (self.openSimplex.noise2D(chunkX*width/self.divisor, chunkZ*width/self.divisor)+1) */
			});
			//console.log(stat);
		}

		if(chunkY<=self.bedrock-10){
			this.fullyFillChunk(chunk,[materialsMap.air]);
			return ;
		}
		if(chunkY<=self.bedrock){
			this.fullyFillChunk(chunk,[materialsMap.bedrock]);
			return ;
		}
		if(chunkY<self.floor){
			this.fullyFillChunk(chunk,this.randomUndercrust);
			return ;
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
		self.plantTrees(chunkX, chunkY, chunkZ, ndvoxels, self.ndsummit[xzKey]);
		self.plantGrass(chunkX, chunkY, chunkZ, ndvoxels, self.ndsummit[xzKey]);
		self.addWater(chunkX, chunkY, chunkZ, ndvoxels, self.ndsummit[xzKey]);

		//if (debug) {
		//	console.log('stat',chunkX,chunkY,chunkZ,stat);
		//}
	}

	pointsInside(chunkX: number, chunkZ: number, width: number, func: any) {
		for (var x = 0; x < width ; x++) {
			for (var z = 0; z < width ; z++) {
				func(chunkX*width+x,chunkZ*width+z,x, z);
			}
		}
	}

	positionGenerator(chunkX:number,chunkY:number,chunkZ:number,ndvoxels:any,ndsummit:any, alea:number, max:number,fn:any){
		var self=this;
		for(let i=0;i<=max;i++){
			var [x,z]=[
				Math.floor((self.openSimplex.noise2D( chunkX+i+alea, chunkZ  ) + 1)*16),
				Math.floor((self.openSimplex.noise2D( chunkX , chunkZ+i+alea ) + 1)*16)
			];
			let y = ndsummit.get(x,z);
			if ((chunkY+0)*ndvoxels.shape[1]<=y && y <(chunkY+1)*ndvoxels.shape[1]){
				fn(x,y,z);
			}
		}
	}

	plantTrees(chunkX:number, chunkY:number,chunkZ:number, ndvoxels:any, ndsummit:any){
		var self=this;
		self.positionGenerator(chunkX,chunkY,chunkZ,ndvoxels,ndsummit,1,self.treeRandomMax,function(x:any,y:any,z:any){
			PineTreeGenerator.generate(ndvoxels,x,y,z);
		});
	}

	plantGrass(chunkX:number, chunkY:number,chunkZ:number, ndvoxels:any, ndsummit:any){
		var self=this;
		self.positionGenerator(chunkX,chunkY,chunkZ,ndvoxels,ndsummit,2,self.grassRandomMax,function(x:any,y:any,z:any){
			ndvoxels.set(x,y+1,z,materialsMap.plankOak);
		});
	}

	addWater(chunkX:number, chunkY:number,chunkZ:number, ndvoxels:any, ndsummit:any){
		if(chunkY !== 0){
			return;
		}
		var rp = this.getRelativePos([-36,17,-15]);
		if(rp.chunkX==chunkX && rp.chunkY==chunkY && rp.chunkZ==chunkZ){
			this.addFlow(ndvoxels,rp.offsetZ,rp.offsetY,rp.offsetX,materialsMap.water);
		}
		/*for(let i=0;i<=self.waterRandomMax;i++){
			var x:number,z:number;
			[x,z]=[
				Math.floor((self.openSimplex.noise2D(chunkX+i*2, chunkZ) + 1)*16),
				Math.floor((self.openSimplex.noise2D(chunkX, chunkZ+i*2) + 1)*16)
			];

			let y = ndsummit.get(x,z);
			if ((chunkY+0)*ndvoxels.shape[1]<=y && y <(chunkY+1)*ndvoxels.shape[1] && y<=10){
				console.log('water',chunkX,chunkZ,chunkX*32+x, chunkZ*32+z,ndsummit.get(x,z))
				ndvoxels.set(x,y,z,materialsMap.water);
			}
		}*/
	}

	addFlow(ndvoxels:any,x:number,y:number,z:number,flowMaterial:any){
		let stack:any[]=[];
		let added:any[]=[]
		let [width,height] = [ndvoxels.shape[0],ndvoxels.shape[2]]
		//this.dumpVoxels(ndvoxels,width,height,y );
		if(ndvoxels.get(x,y,z) != flowMaterial){
			stack.push({x:x, y:y, z:z});
			while (stack.length>0 && added.length<5000){
				let n = stack.pop();
				if(!ndvoxels.get(n.x, n.y, n.z) ){
					let west = {x:n.x, y:n.y, z:n.z};
					let east = {x:n.x, y:n.y, z:n.z};
					while (west.x>0 && !ndvoxels.get(west.x-1, west.y, west.z)){
						west.x--;
					}
					while (east.x<(width-1) && !ndvoxels.get(east.x+1, east.y, east.z)){
						east.x++;
					}
					for (let c=west.x; c<=east.x; c++){
						ndvoxels.set(c, n.y, n.z, flowMaterial);
						added.push({x:c, y:n.y, z:n.z});
						if(n.z>1 && !ndvoxels.get(c, n.y, n.z-1)){
							stack.push({x:c, y:n.y, z:n.z-1});
						}
						if(n.z<(height-1) && !ndvoxels.get(c, n.y, n.z+1)){
							stack.push({x:c, y:n.y, z:n.z+1});
						}
					}
				}
			}
		}
		//this.dumpVoxels(ndvoxels,width,height,y);
		return added;
	}
}
