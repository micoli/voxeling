// dependencies;
import {EventEmitter} from 'events';
var duplexEmitter = require('duplex-emitter');
var extend = require('extend');
//import { Engine } from './voxel-engine-stackgl';


module.exports = (engine: any, opts: any) => new Voxelmaterials(engine, opts);
module.exports.pluginInfo = {
	loadAfter: ['voxel-registry']
};

export class Voxelmaterials extends EventEmitter {
	engine: any; //Engine
	registry : any;
	constructor(engine: any, opts: any) {
		super();
		var self = this;
		this.engine = engine;
		this.registry = this.engine.plugins.get('voxel-registry');
		this.registry.registerBlock('grass', {texture: ['grass_top', 'dirt', 'grass_side'], hardness:1.0, itemDrop: 'dirt', effectiveTool: 'spade'});
		this.registry.registerBlock('dirt', {texture: 'dirt', hardness:0.75, effectiveTool: 'spade'});
		this.registry.registerBlock('stone', {displayName: 'Smooth Stone', texture: 'stone', hardness:10.0, itemDrop: 'cobblestone', effectiveTool: 'pickaxe', requiredTool: 'pickaxe'});
		this.registry.registerBlock('logOak', {displayName: 'Oak Wood', texture: ['log_oak_top', 'log_oak_top', 'log_oak'], hardness:2.0, effectiveTool: 'axe', creativeTab: 'plants'});
		this.registry.registerBlock('cobblestone', {texture: 'cobblestone', hardness:10.0, effectiveTool: 'pickaxe', requiredTool: 'pickaxe'});
		this.registry.registerBlock('oreCoal', {displayName: 'Coal Ore', texture: 'coal_ore', itemDrop: 'coal', hardness:15.0, requiredTool: 'pickaxe'});
		this.registry.registerBlock('oreIron', {displayName: 'Iron Ore', texture: 'iron_ore', hardness:15.0, requiredTool: 'pickaxe'});
		this.registry.registerBlock('brick', {texture: 'brick'}); // some of the these blocks don't really belong here..do they?
		this.registry.registerBlock('obsidian', {texture: 'obsidian', hardness: 128, requiredTool: 'pickaxe'});
		this.registry.registerBlock('leavesOak', {displayName: 'Oak Leaves', texture: 'leaves_oak', transparent: true, hardness: 0.1, creativeTab: 'plants',
		// if voxel-food apple is enabled, drop it when breaking laves (oak apples)
		itemDrop: this.registry.getItemProps('apple') ? 'apple' : null});

		this.registry.registerBlock('logBirch', {texture: ['log_birch_top', 'log_birch_top', 'log_birch'], hardness:2.0,
		displayName: 'Birch Wood', effectiveTool: 'axe', creativeTab: 'plants'}); // TODO: generate
	}
	enable(){}
	disable(){}
}
