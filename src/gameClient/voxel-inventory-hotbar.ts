'use strict';

import {EventEmitter} from 'events';
const InventoryWindow = require('./inventory-window');
const ever = require('ever');

module.exports = (game:any, opts:any) => {
	if (game.isClient) {
		return new InventoryHotbarClient(game, opts);
	} else {
		return new InventoryHotbarCommon(game, opts);
	}
};

module.exports.pluginInfo = {
	loadAfter: ['voxel-carry', 'voxel-registry', 'voxel-keys']
};

class InventoryHotbarCommon extends EventEmitter {
	game:any;
	inventory:any;
	selectedIndex:number=0;
	count:number=0;
	constructor(game:any, opts:any) {
		super();
		this.game = game;;

		if (!opts) opts = {};

		this.inventory = game.plugins.get('voxel-carry').inventory || opts.playerInventory; // TODO: proper error if voxel-carry missing
		if (!this.inventory ) throw new Error('voxel-inventory-dialog requires "voxel-carry" plugin or playerInventory" set to inventory instance');

		this.selectedIndex = 0;
	}

	enable() {
	}

	disable() {
	}

	give(itemPile:any){
		return this.inventory.give(itemPile);
	}

	take(itemPile:any) {
		return this.inventory.take(itemPile);
	}

	// take some items from the pile the player is currently holding
	takeHeld() {
		if (this.count === undefined) this.count = 1;
		return this.inventory.takeAt(this.selectedIndex, this.count);
	}

	// completely replace held item pile
	replaceHeld(itemPile:any) {
		return this.inventory.set(this.selectedIndex, itemPile);
	}

	// get the pile of items the player is currently holding
	held() {
		return this.inventory.get(this.selectedIndex);
	}

	setSelectedIndex(x:number) {
		this.selectedIndex = x;
	}
}

class InventoryHotbarClient extends InventoryHotbarCommon {
	key:any;
	wheelEnable:boolean=false;
	wheelScale:number=4;
	keys:any;
	inventoryWindow:any;
	onSlots:any;
	mousewheel:any;
	constructor(game:any, opts:any) {
		super(game, opts);

		this.game = game;

		this.keys = game.plugins.get('voxel-keys');
		if (!this.keys) throw new Error('voxel-inventory-hotbar requires voxel-keys plugin');

		this.wheelEnable = opts.wheelEnable !== undefined ? opts.wheelEnable : false; // enable scroll wheel to change slots?
		this.wheelScale = opts.wheelScale !== undefined ? opts.wheelScale : 1.0;  // mouse wheel scrolling sensitivity

		const registry = game.plugins.get('voxel-registry');
		const windowOpts = opts.windowOpts !== undefined ? opts.windowOpts : {};
		if (!windowOpts.registry && registry) windowOpts.registry = registry;
		if (!windowOpts.inventory) windowOpts.inventory = this.inventory;

		if (windowOpts.inventorySize === undefined) windowOpts.inventorySize = opts.inventorySize;
		if (windowOpts.inventorySize === undefined) windowOpts.inventorySize = this.inventory.size();

		if (windowOpts.width === undefined) windowOpts.width = opts.width;
		if (windowOpts.width === undefined) windowOpts.width = windowOpts.inventorySize; // default to one row

		this.inventoryWindow = new InventoryWindow(windowOpts);
		this.inventoryWindow.selectedIndex = 0;
		//this.setSelectedIndex(0); // can't set this early; requires DOM

		const container = this.inventoryWindow.createContainer();

		// center at bottom of screen
		let outerDiv:any;
		if(opts.container){
			outerDiv = opts.container;
			outerDiv.style.width = '100%';
			outerDiv.style.textAlign = 'center';
			outerDiv.appendChild(container);
		}else{
			container.style.bottom = '0px';
			container.style.zIndex = 5;
			container.style.width = '100%';
			container.style.position = 'fixed';
			container.style.float = '';
			container.style.border = '';  // not tight around edges
			outerDiv = document.createElement('div');
			outerDiv.style.width = '100%';
			outerDiv.style.textAlign = 'center';
			outerDiv.appendChild(container);
			document.body.appendChild(outerDiv);
		}

		this.enable();
	}

	/*createContainer():any {
		let container = document.createElement('div');
		for (let i = 0; i < this.inventoryWindow.inventorySize; ++i) {
			const slotItem = this.inventory.get(i)

			const node = this.inventoryWindow.createSlotNode(slotItem);
			this.inventoryWindow.setBorderStyle(node, i);
			this.inventoryWindow.bindSlotNodeEvent(node, i);

			this.inventoryWindow.slotNodes.push(node);
			container.appendChild(node);
		}

		const widthpx = this.inventoryWindow.width * (this.inventoryWindow.textureSize + this.inventoryWindow.borderSize * 2) + 2 * this.inventoryWindow.borderSize;
		container.setAttribute('style', `
			display: block;
			float: left;
			width:  ${widthpx}px;
			-moz-user-select: none;
			-webkit-user-select: none;
			-ms-user-select: none;
		`);

		this.inventoryWindow.container = container;
		return container;
	}*/

	setSelectedIndex(x:any) {
		let event:any = {
			oldIndex: this.selectedIndex,
			newIndex:x,
			cancelled:false,
		};

		this.emit('selectionChanging', event);
		if (event.cancelled) return;

		this.inventoryWindow.setSelected(x);
		super.setSelectedIndex(x);
	}

	enable() {
		this.inventoryWindow.container.style.visibility = '';
		this.onSlots = {};

		if (this.wheelEnable) {
			ever(document.body).on('mousewheel', this.mousewheel = (ev:any) => { // TODO: also DOMScrollWheel for Firefox
				console.log('mousewheel',ev);
				let delta = ev.wheelDelta;
				delta /= this.wheelScale;
				delta = Math.floor(delta);

				let newSlot = this.selectedIndex + delta;
				function true_modulo(a:number, b:number) { return (a % b + b) % b; } // a %% b
				newSlot = true_modulo(newSlot, this.inventoryWindow.width);
				console.log(newSlot);
				this.setSelectedIndex(newSlot);
			});
		}

		if (this.game.shell || this.game.buttons.bindings) { // configurable bindings available
			for (let slot = 0; slot <= 9; ++slot) {
				// key numeric 1 is slot 0th, 2 is 1st, .. 0 is last
				let key;
				if (slot === 9) {
					key = '0';
				} else {
					key = ''+(slot + 1);
				}

				// human-readable keybinding name (1-based)
				const slotName = 'slot' + (slot + 1);

				if (this.game.shell) {
					this.game.shell.bind(slotName, key);
				} else if (this.game.buttons.bindings) {
					this.game.buttons.bindings[key] = slotName;
				}

				this.keys.down.on(slotName, this.onSlots[key] = () => {
					this.setSelectedIndex(slot);
				});
			}
		} else {  // fallback kb-controls support
			throw new Error('fallback kb-controls support removed');
		}

		super.enable();
	}

	disable() {
		this.inventoryWindow.container.style.visibility = 'hidden';

		if (this.mousewheel !== undefined) ever(document.body).removeListener('mousewheel', this.mousewheel);

		if (this.game.shell) {
			for (let key = 1; key <= 10; ++key) {
				this.game.shell.unbind('slot' + key);
				this.keys.down.removeListener('slot' + key, this.onSlots[key - 1]);
			}
		} else if (this.game.buttons.bindings) {
			for (let key = 1; key <= 10; ++key) {
				delete this.game.buttons.bindings[key - 1];
				this.keys.down.removeListener('slot' + key, this.onSlots[key - 1]);
			}
			//} else {
			//ever(document.body).removeListener('keydown', this.keydown);
		}

		super.disable();
	}

	refresh() {
		this.inventoryWindow.refresh();
	}
}
