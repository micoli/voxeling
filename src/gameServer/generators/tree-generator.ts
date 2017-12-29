const ndarray = require('ndarray');
import { weightedRandomCorpusA,getRandomInt } from '../weighted-random';
import materialsMap from './server-land-materials';

export class TreeGenerator {
	static treeShape:any[]=[
		[[0,3,4,3,0],[0,7,8,7,0],[0,7,8,7,0],[0,7,8,7,0],[0,7,8,7,0]],
		[[3,3,3,3,3],[7,6,6,6,7],[7,6,6,6,7],[7,6,6,6,7],[3,3,3,3,3]],
		[[4,3,2,3,4],[8,6,2,6,8],[8,6,2,6,8],[8,6,2,6,8],[4,3,2,3,4]],
		[[3,3,3,3,3],[7,6,6,6,7],[7,6,6,6,7],[7,6,6,6,7],[3,3,3,3,3]],
		[[0,3,4,3,0],[0,7,8,7,0],[0,7,8,7,0],[0,7,8,7,0],[0,3,4,3,0]],
	];

	public static generate(ndvoxels:any, width:number, x:number, basey:number, z:number){
		let self = this;
		var trunkOffset=(self.treeShape.length-1)/2;
		var treeHeight=getRandomInt(4,7);
		var leavesHeight=self.treeShape[0].length;
		if(basey<=(width-treeHeight-leavesHeight)){
			for(let h=1;h<=(treeHeight+leavesHeight);h++){
				ndvoxels.set(x,basey+h,z,materialsMap.plankOak);
			}
			for (var py=treeHeight;py<treeHeight+leavesHeight;py++){
				for (var px=0;px<self.treeShape[0][0].length;px++){
					for (var pz=0;pz<self.treeShape[0][0].length;pz++){
						if(getRandomInt(0,10)<=self.treeShape[py][px][pz]){
							ndvoxels.set(x+px-trunkOffset,basey+py,z+pz-trunkOffset,materialsMap.leavesOak);
						}
					}
				}
			}
			/*
			var leavesHeight=getRandomInt(2,4);
			for(let h=treeHeight;h<=(treeHeight+leavesHeight);h++){
				self.treeShape.forEach(function(line,px:number){
					line.forEach(function(cell:any,pz:number){
						if(getRandomInt(0,10)<= ( (h===treeHeight|| h==treeHeight+leavesHeight)?cell/2:cell ) ) {

						}
					})
				});
			}*/
		}

	}
}
