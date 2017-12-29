import { getRandomInt } from '../../weighted-random';
import materialsMap from '../server-land-materials';

export class TreeGenerator {
	static treeShape:any[]=[];
	static trunkMaterial:number = materialsMap.plankOak;
	static leavesMaterial:number = materialsMap.leavesOak;
	static treeHeight:number=4;

	protected static init(){
	}

	protected static getLeavesMaterial(){
		return this.leavesMaterial;
	}
	protected static getTrunkMaterial(){
		return this.trunkMaterial;
	}

	public static generate(ndvoxels:any, width:number, x:number, basey:number, z:number){
		let self = this;
		self.init();
		var trunkOffset = (self.treeShape.length-1)/2;
		var leavesHeight = self.treeShape.length;
		if(basey <= (width-self.treeHeight-leavesHeight)){
			for(let h=1;h<=(self.treeHeight+leavesHeight);h++){
				ndvoxels.set(x,basey+h,z,self.getTrunkMaterial());
			}
			for (var py=self.treeHeight+1;py<self.treeHeight+leavesHeight+1;py++){
				for (var px=0;px<self.treeShape[0][0].length;px++){
					for (var pz=0;pz<self.treeShape[0][0].length;pz++){
						if(getRandomInt(0,9)<=self.treeShape[py-self.treeHeight-1][px][pz]){
							ndvoxels.set(x+px-trunkOffset,basey+py,z+pz-trunkOffset,self.getLeavesMaterial());
						}
					}
				}
			}
		}

	}
}
