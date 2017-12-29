import materialsMap from '../server-land-materials';
import { getRandomInt } from '../../weighted-random';
import { TreeGenerator } from './tree-generator';

export class SmallTreeGenerator extends TreeGenerator {
	static treeShape:any[]=[[
		[8,8,8],
		[8,0,8],
		[8,8,8],
	],[
		[9,9,9],
		[9,0,9],
		[9,9,9],
	],[
		[9,8,9],
		[8,9,8],
		[9,8,9],
	]];
	static trunkMaterial:number = materialsMap.plankOak;
	static leavesMaterial:number = materialsMap.leavesOak;

	protected static init(){
		let self = this;
		self.treeHeight = getRandomInt(2,3);
	}

}
