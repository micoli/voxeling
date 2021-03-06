var voxel = require('voxel');
var ray = require('voxel-raycast');
var control = require('voxel-controls');
var inherits = require('inherits');
//var path = require('path');
import {EventEmitter} from 'events';
var collisions = require('collide-3d-tilemap');
var aabb = require('aabb-3d');
var vector = require('gl-vec3');
var SpatialEventEmitter = require('spatial-events');
var regionChange = require('voxel-region-change');
var physical = require('voxel-physicals');
var tic = require('tic')();
var ndarray = require('ndarray');
var isndarray = require('isndarray');
//var obsolete = require('obsolete');
var createPlugins = require('voxel-plugins');
var extend = require('extend');

var BUILTIN_PLUGIN_OPTS:any = {
	'voxel-registry': {},
	'voxel-stitch': {},
	'voxel-shader': {},
	'voxel-mesher': {},
	'game-shell-fps-camera': {},
};

var _position = new Array(3);
var _cameraVector = vector.create();
export class Game extends EventEmitter {
	[x: string]: any;
	worldOrigin: any;
	container: any;
	materials: any;
	scene: any;
	cameraPlugin: any;
	mesherPlugin: any;
	stitcher: any;
	pendingChunks: any[];
	chunksNeedsUpdate:any= {};
	asyncChunkGeneration: boolean;
	chunkRegion: any;
	voxelRegion: any;
	region: any;
	spatial: any;
	paused: boolean;
	timer: any;
	collideVoxels: any;
	shell: any;
	isClient: any;
	playerHeight: any;
	voxels:any;
	items: any[];
	meshType: any;
	antialias: any;
	skyColor: any;
	removeDistance: any;
	chunkDistance: any;
	chunkPad: any;
	arrayType: any;
	chunkSize: any;
	cubeSize: number;
	vector: any;
	generateChunks: any;
	constructor(opts: any) {
		super();
		var self = this;

		if (!(this instanceof Game)) {
			return new Game(opts);
		}

		if (!opts) {
			opts = {};
		}
		if (opts.pluginOpts && opts.pluginOpts['voxel-engine']) {
			opts = extend(opts, opts.pluginOpts['voxel-engine']);
		}
		if (opts.pluginOpts && opts.pluginOpts['voxel-engine-stackgl']) {
			opts = extend(opts, opts.pluginOpts['voxel-engine-stackgl']);
		}
		if (process && process.hasOwnProperty('browser') && this.notCapable(opts)) {
			return;
		}

		// is this a client or a headless server
		this.isClient = Boolean((typeof opts.isClient !== 'undefined') ? opts.isClient : process.browser);

		if (!('generateChunks' in opts)) {
			opts.generateChunks = true;
		}
		this.generateChunks = opts.generateChunks;
		this.setConfigurablePositions(opts);
		this.configureChunkLoading(opts);
		this.setDimensions(opts);
		//obsolete(this, 'THREE');
		this.vector = vector;
		//obsolete(this, 'glMatrix', 'use your own gl-matrix, gl-vec3, or gl-vec4');
		this.arrayType = opts.arrayType || {
			'1': Uint8Array,
			'2': Uint16Array,
			'4': Uint32Array
		}[opts.arrayTypeSize] || Uint8Array;
		this.cubeSize = 1; // backwards compat
		this.chunkSize = opts.chunkSize || 32;
		this.chunkPad = opts.chunkPad || 4;

		// chunkDistance and removeDistance should not be set to the same thing
		// as it causes lag when you go back and forth on a chunk boundary
		this.chunkDistance = opts.chunkDistance || 2;
		this.removeDistance = opts.removeDistance || this.chunkDistance + 1;

		this.skyColor = opts.skyColor || 0xBFD1E5;
		this.antialias = opts.antialias;
		this.playerHeight = opts.playerHeight || 1.62;
		this.meshType = opts.meshType || 'surfaceMesh';

		// was a 'voxel' module meshers object, now using voxel-mesher(ao-mesher);
		//obsolete(this, 'mesher', 'replaced by voxel-mesher');

		this.items = [];
		this.voxels = voxel(this);

		// was a three.js Scene instance, mainly used for scene.add(), objects, lights TODO: scene graph replacement? or can do without?
		//obsolete(this, 'scene');

		// hooked up three.js Scene, created three.js PerspectiveCamera, added to element
		// TODO: add this.view.cameraPosition(), this.view.cameraVector()? -> [x,y,z]  to game-shell-fps-camera, very useful
		//obsolete(this, 'view');

		// used to be a three.js PerspectiveCamera set by voxel-view;
		//see also basic-camera but API not likely compatible (TODO: make it compatible?);
		//obsolete(this, 'camera');

		// the game-shell
		if (this.isClient) /*GZ: Do not load on server, as document element is missing*/ {
			var createShell = require('gl-now');
			var shellOpts:any = shellOpts || {};
			shellOpts.clearColor = [
				(this.skyColor >> 16) / 255.0,
				((this.skyColor >> 8) & 0xff) / 255.0,
				(this.skyColor & 0xff) / 255.0,
				1.0
			];
			shellOpts.pointerLock = opts.pointerLock !== undefined ? opts.pointerLock : true;
			shellOpts.stickyPointerLock = opts.stickyPointerLock !== undefined ? opts.stickyPointerLock : shellOpts.pointerLock;
			shellOpts.element = this.createContainer(opts);
			var shell = createShell(shellOpts);

			shell.on('gl-error', function(err:any) {
				// normally not reached; notCapable() checks for WebGL compatibility first
				document.body.appendChild(document.createTextNode('Fatal WebGL error: ' + err));
			});

			this.shell = shell;
		}

		// setup plugins
		var pluginLoaders = opts.pluginLoaders || {};
		extend(pluginLoaders, {
			'voxel-engine-stackgl': Game, //require('./'),
			'voxel-registry': require('voxel-registry'),
			'voxel-stitch': require('voxel-stitch'),
			'voxel-shader': require('voxel-shader'),
			'voxel-mesher': require('voxel-mesher'),
			'game-shell-fps-camera': require('game-shell-fps-camera')
		});
		var plugins = createPlugins(this, {
			masterPluginName: 'voxel-engine-stackgl',
			loaders: pluginLoaders,
			require: opts.require // optional (opts.pluginLoaders favored instead);
		});

		this.collideVoxels = collisions(
			this.getBlock.bind(this),
			1,
			[Infinity, Infinity, Infinity],
			[-Infinity, -Infinity, -Infinity]
		);

		this.timer = this.initializeTimer((opts.tickFPS || 16));
		this.paused = false;

		this.spatial = new SpatialEventEmitter;
		this.region = regionChange(this.spatial, aabb([0, 0, 0], [1, 1, 1]), this.chunkSize);
		this.voxelRegion = regionChange(this.spatial, 1);
		this.chunkRegion = regionChange(this.spatial, this.chunkSize);

		this.voxelRegion.on('change', function(pos: any) {
		console.log('VoxelRegion change', pos);
		});

		this.asyncChunkGeneration = false;

		// contains chunks that has had an update this tick. Will be generated right before redrawing the frame
		this.chunksNeedsUpdate = {};
		// contains new chunks yet to be generated. Handled by game.loadPendingChunks
		this.pendingChunks = [];

		if (this.isClient) {
			if (opts.exposeGlobal) {
				window.game = window.g = this;
			}
		}


		self.chunkRegion.on('change', function(newChunk:any) {
			self.removeFarChunks();
		});

		// client side only after this point
		if (!this.isClient) {
			return;
		}

		// materials
		if ('materials' in opts) {
			throw 'opts.materials replaced with voxel-registry registerBlock()'; // TODO: bridge?
		}

		//this.paused = true // TODO: should it start paused, then unpause when pointer lock is acquired?

		this.initializeControls(opts);

		// setup plugins
		var pluginOpts = opts.pluginOpts || {};

		for (let name in BUILTIN_PLUGIN_OPTS) {
			pluginOpts[name] = pluginOpts[name] || BUILTIN_PLUGIN_OPTS[name];
		}

		for (let name in pluginOpts) {
			plugins.add(name, pluginOpts[name]);
		}
		plugins.loadAll();

		// textures loaded, now can render chunks
		this.stitcher = plugins.get('voxel-stitch');
		this.stitcher.on('updatedSides', function() {
			if (self.generateChunks) {
				self.handleChunkGeneration();
			}
			self.showAllChunks();

			// TODO: fix async chunk gen, loadPendingChunks() may load 1 even if this.pendingChunks empty
			setTimeout(function() {
				self.asyncChunkGeneration = 'asyncChunkGeneration' in opts ? opts.asyncChunkGeneration : true;
			}, 2000);
		});
		this.mesherPlugin = plugins.get('voxel-mesher');

		this.cameraPlugin = plugins.get('game-shell-fps-camera'); // TODO: support other plugins implementing same API

		this.emit('engine-init', this);
	}

	toString() {
		return 'voxel-engine-stackgl';
	}

	// # External API

	voxelPosition(gamePosition: any) {
		var _ = Math.floor;
		var p = gamePosition;
		var v = [];
		v[0] = _(p[0]);
		v[1] = _(p[1]);
		v[2] = _(p[2]);
		return v;
	}

	cameraPosition() {
		if (this.cameraPlugin) {
			this.cameraPlugin.getPosition(_position);
		}

		return _position;
	}

	cameraVector() {
		if (this.cameraPlugin) {
			this.cameraPlugin.getVector(_cameraVector);
		}

		return _cameraVector;
	}

	makePhysical(target: any, envelope: any, blocksCreation: any) {
		var vel = this.terminalVelocity;
		envelope = envelope || [2 / 3, 1.5, 2 / 3];
		var obj = physical(target, this.potentialCollisionSet(), envelope, {x: vel[0], y: vel[1], z: vel[2]});
		obj.blocksCreation = !!blocksCreation;
		return obj;
	}

	addItem(item: any) {
		if (!item.tick) {
			var newItem = physical(
				item.mesh,
				this.potentialCollisionSet(),
				[item.size, item.size, item.size]
			);

			if (item.velocity) {
				newItem.velocity.copy(item.velocity);
				newItem.subjectTo(this.gravity);
			}

			newItem.repr = function() {
				return 'debris';
			};
			newItem.mesh = item.mesh;
			newItem.blocksCreation = item.blocksCreation;

			item = newItem;
		}

		this.items.push(item);
		if (item.mesh) {
			this.scene.add(item.mesh);
		}
		return this.items[this.items.length - 1];
	}

	removeItem(item: any) {
		var ix = this.items.indexOf(item);
		if (ix < 0) {
			return;
		}
		this.items.splice(ix, 1);
		if (item.mesh) {
			this.scene.remove(item.mesh);
		}
	}

	// only intersects voxels, not items (for now);
	// backwards compat
	raycast(start: any, direction: any, maxDistance: any, epilson?: any) {
		return this.raycastVoxels(start, direction, maxDistance, epilson);
	}

	raycastVoxels(start: any, direction: any, maxDistance: any, epilson?: any): any {
		if (!start) {
			return this.raycastVoxels(this.cameraPosition(), this.cameraVector(), 10);
		}

		var hitNormal = [0, 0, 0];
		var hitPosition = [0, 0, 0];
		var cp = start || this.cameraPosition();
		var cv = direction || this.cameraVector();
		var hitBlock = ray(this, cp, cv, maxDistance || 10.0, hitPosition, hitNormal, epilson || this.epilson);
		if (hitBlock <= 0) {
			return false;
		}
		var adjacentPosition = [0, 0, 0];
		var voxelPosition = this.voxelPosition(hitPosition);
		vector.add(adjacentPosition, voxelPosition, hitNormal);

		if (Math.abs(hitNormal[0] + hitNormal[1] + hitNormal[2]) !== 1) {
			hitNormal[0] = 0;
			hitNormal[1] = 1;
			hitNormal[2] = 0;
		}

		return {
			position: hitPosition,
			voxel: voxelPosition,
			direction: direction,
			value: hitBlock,
			normal: hitNormal,
			adjacent: adjacentPosition
		};
	}

	canCreateBlock(pos:any) {
		pos = this.parseVectorArguments(arguments);
		var floored = pos.map(function(i:any) {
			return Math.floor(i);
		});
		var bbox = aabb(floored, [1, 1, 1]);

		for (var i = 0, len = this.items.length; i < len; ++i) {
			var item = this.items[i];
			var itemInTheWay = item.blocksCreation && item.aabb && bbox.intersects(item.aabb());
			if (itemInTheWay) {
				return false;
			}
		}

		return true;
	}

	createBlock(pos:any, val:any) {
		if (typeof val === 'string') {
			val = this.materials.find(val);
		}
		if (!this.canCreateBlock(pos)) {
			return false;
		}
		this.setBlock(pos, val);
		return true;
	}

	setBlock(pos:any, val:any) {
		if (typeof val === 'string') {
			val = this.materials.find(val);
		}
		var old = this.voxels.voxelAtPosition(pos, val);
		var c = this.voxels.chunkAtPosition(pos);
		var chunk = this.voxels.chunks[c.join('|')];
		if (!chunk) {
			return;
		}// todo - does self.emit('missingChunk', c.join('|')) make sense here?
		this.addChunkToNextUpdate(chunk);
		this.spatial.emit('change-block', pos, old, val);
		this.emit('setBlock', pos, val, old);
	}

	getBlock(pos:any) {
		pos = this.parseVectorArguments(arguments);
		return this.voxels.voxelAtPosition(pos);
	}

	blockPosition(pos:any) {
		pos = this.parseVectorArguments(arguments);
		var ox = Math.floor(pos[0]);
		var oy = Math.floor(pos[1]);
		var oz = Math.floor(pos[2]);
		return [ox, oy, oz];
	}

	blocks(low:any, high:any, iterator:any) {
		var l = low, h = high;
		var d = [h[0] - l[0], h[1] - l[1], h[2] - l[2]];
		if (!iterator) {
			var voxels = new this.arrayType(d[0] * d[1] * d[2]);
		}
		var i = 0;
		for (var z = l[2]; z < h[2]; ++z) {
			for (var y = l[1]; y < h[1]; ++y) {
				for (var x = l[0]; x < h[0]; ++x, ++i) {
					if (iterator) {
						iterator(x, y, z, i);
					} else {
						voxels[i] = this.voxels.voxelAtPosition([x, y, z]);
					}
				}
			}
		}
		if (!iterator) {
			return {voxels: voxels, dims: d};
		}
	}

	// backwards compat;
	createAdjacent(hit:any, val:any) {
		this.createBlock(hit.adjacent, val);
	}

	appendTo(element:any) {
		// no-op; game-shell to append itself;
	}

	// # Defaults/options parsing;

	gravity = [0, -0.0000036, 0];
	friction = 0.3;
	epilson = 1e-8;
	terminalVelocity = [0.9, 0.1, 0.9];

	defaultButtons = {
		'W': 'forward'
		, 'A': 'left'
		, 'S': 'backward'
		, 'D': 'right'
		, '<up>': 'forward'
		, '<left>': 'left'
		, '<down>': 'backward'
		, '<right>': 'right'
		, '<mouse 1>': 'fire'
		, '<mouse 3>': 'firealt'
		, '<space>': 'jump'
		, '<shift>': 'crouch'
		, '<control>': 'alt'
		, '<tab>': 'sprint'
	};

	// used in methods that have identity function(pos) {}
	parseVectorArguments(args:any) {
		if (!args) {
			return false;
		}
		if (args[0] instanceof Array) {
			return args[0];
		}
		return [args[0], args[1], args[2]];
	}

	setConfigurablePositions(opts:any) {
		var sp = opts.startingPosition;
		this.startingPosition = sp || [35, 1024, 35];
		var wo = opts.worldOrigin;
		this.worldOrigin = wo || [0, 0, 0];
	}

	createContainer(opts:any) {
		if (opts.container) {
			return opts.container;
		}

		// based on game-shell makeDefaultContainer();
		var container = document.createElement("div");
		container.tabindex = 1;
		container.style.position = "absolute";
		container.style.left = "0px";
		container.style.right = "0px";
		container.style.top = "0px";
		container.style.bottom = "0px";
		container.style.height = "100%";
		container.style.overflow = "hidden";
		document.body.appendChild(container);
		document.body.style.overflow = "hidden"; //Prevent bounce;
		document.body.style.height = "100%";
		return container;
	}

	setDimensions(opts:any) {
		if (opts.container) {
			this.container = opts.container;
		}
		if (opts.container && opts.container.clientHeight) {
			this.height = opts.container.clientHeight;
		} else {
			this.height = typeof window === "undefined" ? 1 : window.innerHeight;
		}
		if (opts.container && opts.container.clientWidth) {
			this.width = opts.container.clientWidth;
		} else {
			this.width = typeof window === "undefined" ? 1 : window.innerWidth;
		}
	}

	notCapable(opts:any) {
		var self = this;
		/*if (!Detector().webgl) {
			if (!this.reportedNotCapable) {
				document.body.appendChild(self.notCapableMessage());
			}
			this.reportedNotCapable = true; // only once;
			return true;
		}*/
		return false;
	}

	notCapableMessage() {
		var wrapper = document.createElement('div');
		wrapper.className = "errorMessage";
		var a = document.createElement('a');
		a.title = "You need WebGL and Pointer Lock (Chrome 23/Firefox 14) to play this game. Click here for more information.";
		a.innerHTML = a.title;
		a.href = "http://get.webgl.org";
		wrapper.appendChild(a);
		return wrapper;
	}

	// # Physics/collision related methods;

	control(target:any) {
		this.controlling = target;
		return this.controls.target(target);
	}

	potentialCollisionSet() {
		return [{collide: this.collideTerrain.bind(this)}];
	}

	/**;
	 * Get the position of the player under control.;
	 * If there is no player under control, return;
	 * current position of the game's camera.;
	 *;
	 * @return {Array} an [x, y, z] tuple;
	 */
	playerPosition() {
		var target = this.controls.target();
		if (!target) {
			return this.cameraPosition();
		}
		var position = target.avatar.position;
		return [position.x, position.y, position.z];
	}

	playerAABB(position:any) {
		var pos = position || this.playerPosition();
		var lower:any[] = [];
		var upper = [1 / 2, this.playerHeight, 1 / 2];
		var playerBottom = [1 / 4, this.playerHeight, 1 / 4];
		vector.subtract(lower, pos, playerBottom);
		var bbox = aabb(lower, upper);
		return bbox;
	}

	collideTerrain(other:any, bbox:any, vec:any, resting:any) {
		var self = this;
		this.collideVoxels(bbox, vec, function hit(axis:any, tile:any, coords:any, dir:any, edge:any) {
			if (!tile) {
				return;
			}
			if (Math.abs(vec[axis]) < Math.abs(edge)) {
				return;
			}
			vec[axis] = edge;
			other.acceleration[axis] = 0;
			resting[['x', 'y', 'z'][axis]] = dir; // TODO: change to glm vec3 array?;
			other.friction[(axis + 1) % 3] = other.friction[(axis + 2) % 3] = axis === 1 ? self.friction : 1;
			return true;
		});
	}

	// # Chunk related methods;

	configureChunkLoading(opts:any) {
		var self = this;
		if (!opts.generateChunks) {
			return;
		}
		if (!opts.generate) {
			this.generate = voxel.generator.Sphere;
		} else if (typeof opts.generate === 'string') {
			this.generate = voxel.generator[opts.generate];
		} else {
			this.generate = opts.generate;
		}
		if (opts.generateVoxelChunk) {
			this.generateVoxelChunk = opts.generateVoxelChunk;
		} else {
			this.generateVoxelChunk = function(low:any, high:any) {
				return voxel.generate(low, high, self.generate, self);
			};
		}
	}

	worldWidth() {
		return this.chunkSize * 2 * this.chunkDistance;
	}

	chunkToWorld(pos:any) {
		return [
			pos[0] * this.chunkSize,
			pos[1] * this.chunkSize,
			pos[2] * this.chunkSize
		];
	}

	removeFarChunks(playerPosition?:any) {
		var self = this;
		playerPosition = playerPosition || this.playerPosition();
		var nearbyChunks = this.voxels.nearbyChunks(playerPosition, this.removeDistance).map(function(chunkPos:any) {
			return chunkPos.join('|');
		});
		Object.keys(self.voxels.chunks).map(function(chunkIndex:any) {
			if (nearbyChunks.indexOf(chunkIndex) > -1) {
				return;
			}
			var chunk = self.voxels.chunks[chunkIndex];
			var mesh = self.voxels.meshes[chunkIndex];
			var pendingIndex = self.pendingChunks.indexOf(chunkIndex);
			if (pendingIndex !== -1) {
				self.pendingChunks.splice(pendingIndex, 1);
			}
			if (!chunk) {
				return;
			}
			var chunkPosition = chunk.position;
			if (mesh) {
				// dispose of the gl-vao meshes;
				for (var key in mesh.vertexArrayObjects) {
					mesh.vertexArrayObjects[key].dispose();
				}
			}
			delete self.voxels.chunks[chunkIndex];
			delete self.voxels.meshes[chunkIndex];
			self.emit('removeChunk', chunkPosition);
		});
		self.voxels.requestMissingChunks(playerPosition);
	}

	addChunkToNextUpdate(chunk:any) {
		this.chunksNeedsUpdate[chunk.position.join('|')] = chunk;
	}

	updateDirtyChunks() {
		var self = this;
		Object.keys(this.chunksNeedsUpdate).forEach(function showChunkAtIndex(chunkIndex) {
			var chunk = self.chunksNeedsUpdate[chunkIndex];
			self.emit('dirtyChunkUpdate', chunk);
			self.showChunk(chunk);
		});
		this.chunksNeedsUpdate = {};
	}

	loadPendingChunks(count?:number) {
		var pendingChunks = this.pendingChunks;

		if (!this.asyncChunkGeneration) {
			count = pendingChunks.length;
		} else {
			count = count || (pendingChunks.length * 0.1);
			count = Math.max(1, Math.min(count, pendingChunks.length));
		}

		for (var i = 0; i < count; i += 1) {
			var chunkPos = pendingChunks[i].split('|');
			var chunk = this.voxels.generateChunk(chunkPos[0] | 0, chunkPos[1] | 0, chunkPos[2] | 0);

			if (this.isClient) {
				this.showChunk(chunk);
			}
		}

		if (count) {
			pendingChunks.splice(0, count);
		}
	}

	getChunkAtPosition(pos:any) {
		var chunkID = this.voxels.chunkAtPosition(pos).join('|');
		var chunk = this.voxels.chunks[chunkID];
		return chunk;
	}

	showAllChunks() {
		for (var chunkIndex in this.voxels.chunks) {
			this.showChunk(this.voxels.chunks[chunkIndex]);
		}
	}

	// Calculate fraction of each voxel type in chunk, for debugging;
	private chunkDensity(chunk:any) {
		var counts:any = {};
		var length = chunk.data.length;
		for (var i = 0; i < length; i += 1) {
			let val = chunk.data[i];
			if (!(val in counts)) {
				counts[val] = 0;
			}

			counts[val] += 1;
		}

		var densities:any = {};
		for (let val in counts) {
			densities[val] = counts[val] / length;
		}
		return densities;
	}

	showChunk(chunk:any, optionalPosition?:any) {
		if (optionalPosition) {
			chunk.position = optionalPosition;
		}

		var chunkIndex = chunk.position.join('|');
		var bounds = this.voxels.getBounds.apply(this.voxels, chunk.position);
		//console.log('showChunk',chunkIndex,'density=',JSON.stringify(this.chunkDensity(chunk)));

		var voxelArray = isndarray(chunk) ? chunk : ndarray(chunk.voxels, chunk.dims);
		var mesh = this.mesherPlugin.createVoxelMesh(
			this.shell.gl,
			voxelArray,
			this.stitcher.voxelSideTextureIDs,
			this.stitcher.voxelSideTextureSizes,
			chunk.position, this.chunkPad
		);

		if (!mesh) {
			// no voxels;
			return null;
		}

		this.voxels.chunks[chunkIndex] = chunk;
		if (this.voxels.meshes[chunkIndex]) {
			// TODO: remove mesh if exists;
			//if (this.voxels.meshes[chunkIndex].surfaceMesh) this.scene.remove(this.voxels.meshes[chunkIndex].surfaceMesh);
			//if (this.voxels.meshes[chunkIndex].wireMesh) this.scene.remove(this.voxels.meshes[chunkIndex].wireMesh);
		}
		this.voxels.meshes[chunkIndex] = mesh;
		this.emit('renderChunk', chunk);
		return mesh;
	}

	// # Debugging methods;

	addMarker(position:any) {
		throw 'voxel-engine-stackgl addMarker not yet implemented TODO: figure out how to fit this into the rendering pipeline';
	}

	addAABBMarker(aabb:any, color:any) {
		throw 'voxel-engine-stackgl addAABBMarker not yet implemented TODO';
	}

	addVoxelMarker(x:any, y:any, z:any, color:any) {
		var bbox = aabb([x, y, z], [1, 1, 1]);
		return this.addAABBMarker(bbox, color);
	}

	// # Misc internal methods;

	onFire(state:any) {
		this.emit('fire', this.controlling, state);
	}

	setInterval = tic.interval.bind(tic);
	setTimeout = tic.timeout.bind(tic);

	tick(delta:any) {
		for (var i = 0, len = this.items.length; i < len; ++i) {
			this.items[i].tick(delta);
		}

		//if (this.materials) this.materials.tick(delta);

		if (this.pendingChunks.length) {
			this.loadPendingChunks();
		}
		if (Object.keys(this.chunksNeedsUpdate).length > 0) {
			this.updateDirtyChunks();
		}

		tic.tick(delta);

		this.emit('tick', delta);

		//if (!this.controls) return // this.controls removed; still load chunks;
		var playerPos = this.playerPosition();
		this.spatial.emit('position', playerPos, playerPos);
	}

	render(delta:any) {
		this.view.render(this.scene);
	}

	// TODO: merge with game-shell render loop?;
	initializeTimer(rate:any) {
		var self = this;
		var accum = 0;
		var now = 0;
		var last:any = null;
		var dt = 0;
		var wholeTick;

		self.frameUpdated = true;
		self.interval = setInterval(timer, 0);

		function timer() {
			if (self.paused) {
				last = Date.now();
				accum = 0;
				return;
			}
			now = Date.now();
			dt = now - (last || now);
			last = now;
			accum += dt;
			if (accum < rate) {
				return;
			}
			wholeTick = ((accum / rate) | 0);
			if (wholeTick <= 0) {
				return;
			}
			wholeTick *= rate;

			self.tick(wholeTick);
			accum -= wholeTick;

			self.frameUpdated = true;
		}
		return self.interval;
	}

	// Create the buttons state object (binding => state), proxying to game-shell .wasDown(binding);
	proxyButtons() {
		var self = this;

		self.buttons = {};

		Object.keys(this.shell.bindings).forEach(function(name) {
			Object.defineProperty(self.buttons, name, {
				'get': function() {
					return self.shell.pointerLock && self.shell.wasDown(name);
				}
			});
		});
	}

	// cleanup key name - based on https://github.com/mikolalysenko/game-shell/blob/master/shell.js;
	private filtered_vkey(k:any) {
		if (k.charAt(0) === '<' && k.charAt(k.length - 1) === '>') {
			k = k.substring(1, k.length - 1);
		}
		k = k.replace(/\s/g, "-");
		return k;
	}

	initializeControls(opts:any) {
		// player control - game-shell handles most controls now;

		// initial keybindings passed in from options;
		//obsolete(this, 'keybindings');
		var keybindings = opts.keybindings || this.defaultButtons;
		for (var key in keybindings) {
			var name = keybindings[key];

			// translate name for game-shell;
			key = this.filtered_vkey(key);

			this.shell.bind(name, key);
		}

		//obsolete(this, 'interact');

		this.proxyButtons(); // sets this.buttons TODO: refresh when shell.bindings changes (bind/unbind);
		this.hookupControls(this.buttons, opts);
	}

	hookupControls(buttons:any, opts:any) {
		opts = opts || {};
		opts.controls = opts.controls || {};
		opts.controls.onfire = this.onFire.bind(this);
		this.controls = control(buttons, opts.controls);
		this.items.push(this.controls);
		this.controlling = null;
	}

	handleChunkGeneration() {
		var self = this;
		this.voxels.on('missingChunk', function(chunkPos:any) {
			self.pendingChunks.push(chunkPos.join('|'));
		});
		this.voxels.requestMissingChunks(this.worldOrigin);
		this.loadPendingChunks(this.pendingChunks.length);
	}

	// teardown methods;
	destroy() {
		clearInterval(this.timer);
	}
}
