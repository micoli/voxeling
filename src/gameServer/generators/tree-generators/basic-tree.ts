import materialsMap from '../server-land-materials';
import { getRandomInt } from '../../weighted-random';
import { TreeGenerator } from './tree-generator';

export class BasicTreeGenerator extends TreeGenerator {
	static treeShape:any[]=[[
		[0,3,4,3,0],
		[3,3,3,3,3],
		[4,3,0,3,4],
		[3,3,3,3,3],
		[0,3,4,3,0]
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,0,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,0,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[7,6,6,6,7],
		[8,6,0,6,8],
		[7,6,6,6,7],
		[0,7,8,7,0],
	],[
		[0,7,8,7,0],
		[3,3,3,3,3],
		[4,3,5,3,4],
		[3,3,3,3,3],
		[0,3,4,3,0],
	]];

	static trunkMaterial:number = materialsMap.plankOak;
	static leavesMaterial:number = materialsMap.leavesOak;

	protected static init(){
		let self = this;
		self.treeHeight = getRandomInt(4,7);
	}

}
