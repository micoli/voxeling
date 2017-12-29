import materialsMap from '../server-land-materials';
import { getRandomInt } from '../../weighted-random';
import { TreeGenerator } from './tree-generator';

export class PineTreeGenerator extends TreeGenerator {
	static treeShape:any[]=[[
		[0,8,9,8,0],
		[8,8,8,8,8],
		[9,8,0,8,9],
		[8,8,8,8,8],
		[0,8,9,8,0]
	],[
		[0,8,9,8,0],
		[8,8,8,8,8],
		[9,8,0,8,9],
		[8,8,8,8,8],
		[0,8,9,8,0]
	],[
		[0,0,0,0,0],
		[0,9,9,9,0],
		[0,9,9,9,0],
		[0,9,9,9,0],
		[0,0,0,0,0],
	],[
		[0,0,0,0,0],
		[0,9,8,9,0],
		[0,8,0,8,0],
		[0,9,8,9,0],
		[0,0,0,0,0],
	],[
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,9,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
	]];

	static trunkMaterial:number = materialsMap.plankOak;
	static leavesMaterial:number = materialsMap.leavesOak;

	protected static init(){
		let self = this;
		self.treeHeight = getRandomInt(4,7);
	}
}
