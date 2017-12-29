const ndarray = require('ndarray');
import { weightedRandomCorpusA,getRandomInt } from '../weighted-random';
import materialsMap from './server-land-materials';

export class TreeGenerator {
	static treeShape:any[]=[[
		[0,3,4,3,0],
		[3,3,3,3,3],
		[4,3,2,3,4],
		[3,3,3,3,3],
		[0,3,4,3,0]
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,2,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,2,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,2,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[3,3,3,3,3],
		[4,3,2,3,4],
		[3,3,3,3,3],
		[0,3,4,3,0],
	]];

	public static generate(ndvoxels:any, width:number, x:number, basey:number, z:number){
		let self = this;
		var trunkOffset = (self.treeShape.length-1)/2;
		var treeHeight = getRandomInt(4,7);
		var leavesHeight = self.treeShape.length;
		if(basey <= (width-treeHeight-leavesHeight)){
			for(let h=1;h<=(treeHeight+leavesHeight);h++){
				ndvoxels.set(x,basey+h,z,materialsMap.plankOak);
			}
			for (var py=treeHeight+1;py<treeHeight+leavesHeight+1;py++){
				for (var px=0;px<self.treeShape[0][0].length;px++){
					for (var pz=0;pz<self.treeShape[0][0].length;pz++){
						if(getRandomInt(0,10)<=self.treeShape[py-treeHeight-1][px][pz]){
							ndvoxels.set(x+px-trunkOffset,basey+py,z+pz-trunkOffset,materialsMap.leavesOak);
						}
					}
				}
			}
		}

	}
}
