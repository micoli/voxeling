var config = require('../config');
var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;
var chunkSize = config.chunkSize;
//console.log('ChunkSize', chunkSize);
var randomName = require('sillyname');

import {Game} from './lib/game';
import {VoxelingClient} from './lib/voxeling-client';
import {InputHandler} from './lib/client-input';
import {WebGL} from './lib/webgl';
import {Textures} from './lib/textures';
import {Player} from './lib/player';
import {Weather} from './lib/sky';
import {Voxels} from './lib/voxels';

import {Camera} from './lib/camera';
import {Lines} from './lib/lines';
import {Physics} from './lib/physics';
import {Coordinates} from '../shared/coordinates';
//var Meshing = require('../lib/meshers/non-blocked')
var raycast = require('voxel-raycast');
var Shapes = require('./lib/shapes');
var Stats = require('./lib/stats');
var timer = require('./lib/timer');
var mesher = require('./lib/meshers/horizontal-merge');
var pool = require('./lib/object-pool');
var trees = require('voxel-trees');
var voxelPlugins = require('voxel-plugins');

var voxelInventoryHotbar = require('voxel-inventory-hotbar');
var voxelRegistry = require('voxel-registry');
var voxelDecals = require('voxel-decals');
var voxelMesher = require('voxel-mesher');
var voxelStitch = require('voxel-stitch');
var voxelReach = require('voxel-reach');
var voxelMine = require('voxel-mine');
var voxelCarry = require('voxel-carry');
var voxelKeys = require('voxel-keys');
var voxelShader = require('voxel-shader');
var kbBindings = require('kb-bindings');
var gameShellFPSCamera = require('game-shell-fps-camera');

/*
//var voxelDebris = require('voxel-debris');
var voxelTrees = require('voxel-trees');
var kbBindings = require('kb-bindings');
var voxelkbBindingsUI = require('kb-bindings-ui');
var voxelDebug = require('voxel-debug');
var datGUI = require('dat-gui');
 * */

var coordinates = new Coordinates(chunkSize);
var client = new VoxelingClient(config);
var webgl: WebGL;
var textures: Textures;

var players: any = {};
console.log(1289);

// UI DIALOG SETUP
var fillMaterials = function(textures: any) {
	var container = (<HTMLInputElement>document.getElementById('textureContainer'));
	var html = '';
	for (var i = 0; i < textures.textureArray.length; i++) {
		var material = textures.textureArray[i];
		//console.log(material);
		var src;
		if ('hidden' in material && material.hidden) {
			continue;
		}
		if ('sides' in material) {
			src = textures.byValue[material.sides[0]].src;
		} else {
			src = material.src;
		}
		html += '<div data-texturevalue="'
			+ material.value
			+ '"><img src="' + src + '" crossorigin="anonymous" />'
			+ '<span>' + material.name + '</span>'
			+ '</div>';
	}
	container.innerHTML = html;
};

var fillSettings = function(textures: any) {
	var container = document.getElementById('settings');
	var html = '';
	for (var i = 0; i < textures.textureArray.length; i++) {
		var index = i + 1;
		var material = textures.textureArray[i];
		if ('sides' in material) {
			continue;
		}
		html += '<input name="' + material.name + '" data-id="' + material.value + '" value="' + material.src + '" /> '
			+ material.name
			+ '<br />';
	}
	container.innerHTML = html;
	$(container).on('blur', 'input', function(e: any) {
		var $el = $(this);
		var id = $el.data('id');
		textures.byValue[id].src = $el.val();
		// Now trigger reload ... need to modify the Textures object
		return false;
	});
};

client.on('close', function() {
	document.getElementById('overlay').className = 'disconnected';
});

client.on('players', function(others: any) {
	var id;
	var ticksPerHalfSecond = 30;
	var calculateAdjustments = function(output: any, current: any, wanted: any) {
		for (var i = 0; i < output.length; i++) {
			output[i] = (wanted[i] - current[i]) / ticksPerHalfSecond;
		}
	};
	for (id in others) {
		var updatedPlayerInfo = others[id];
		var player;
		if (!('positions' in updatedPlayerInfo)) {
			continue;
		}
		if (id in players) {
			player = players[id];
			calculateAdjustments(player.adjustments, player.latest, updatedPlayerInfo.positions);
			player.current = player.latest;
			player.latest = updatedPlayerInfo.positions;
		} else {
			player = players[id] = {
				latest: updatedPlayerInfo.positions,
				current: updatedPlayerInfo.positions,
				adjustments: [0, 0, 0, 0, 0, 0],

				model: new Player(webgl.gl, webgl.shaders.projectionViewPosition, textures.byName['player'])
			};

			player.model.setTranslation(
				updatedPlayerInfo.positions[0],
				updatedPlayerInfo.positions[1],
				updatedPlayerInfo.positions[2]
			);
			player.model.setRotation(
				updatedPlayerInfo.positions[3],
				updatedPlayerInfo.positions[4],
				updatedPlayerInfo.positions[5]
			);
		}
		player.model.setTexture(textures.byName[updatedPlayerInfo.avatar]);
	}
	// Compare players to others, remove old players
	var playerIds = Object.keys(players);
	for (var i = 0; i < playerIds.length; i++) {
		id = playerIds[i];
		if (!(id in others)) {
			delete players[id];
		}
	}
});

client.on('ready', function() {
	var canvas = (<HTMLCanvasElement>document.getElementById('herewego'));
	var inputHandler = new InputHandler(document.body, canvas);

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	webgl = new WebGL(canvas);
	//console.log(config.textures);
	textures = new Textures(config.textures);

	// Wait until textures have fully loaded

	/*var initGame3 = function() {
		new Game({
			pluginLoaders: {
				'voxel-bedrock': require('voxel-bedrock'),
				'voxel-server': require('./lib/voxel-server'),
				'voxel-stitch': require('voxel-stitch'),
				'game-shell-fps-camera': require('game-shell-fps-camera'),
			},
			pluginOpts: {
				'voxel-engine-stackgl': {
					generateChunks: false
				},
				'game-shell-fps-camera': {position: [0, -100, 0]},
				'voxel-bedrock': {},
				'voxel-server': {
					block : 'bedrock',
					voxelingClient : client
				},
				'voxel-stitch':{
					artpacks : ['/ProgrammerArt-ResourcePack.zip']
				},
			}
		});
	};*/
	var initGame = function() {
		// ready=false stops physics from running early
		var ready = false;
		var player = client.player = new Player(webgl.gl, webgl.shaders.projectionViewPosition, textures.byName[client.avatar]);
		var sky = new Weather(webgl.gl, webgl.shaders.projectionViewPosition, textures, player);
		var voxels = client.voxels = new Voxels(
			webgl.gl,
			webgl.shaders.projectionPosition,
			textures,
			// releaseMeshCallback
			function(mesh: any) {
				// Release old mesh
				var transferList = [];
				for (var textureValue in mesh) {
					var texture = mesh[textureValue];
					// Go past the Growable, to the underlying ArrayBuffer
					transferList.push(texture.position.buffer);
					transferList.push(texture.texcoord.buffer);
					transferList.push(texture.normal.buffer);
				}
				// specially list the ArrayBuffer object we want to transfer
				client.worker.postMessage(
					['freeMesh', mesh],
					transferList
				);
			}
		);
		var camera = client.camera = new Camera(canvas, player);
		var game = client.game = new Game(
			config,
			coordinates,
			player,
			function() {// regionChangeCallback
				client.regionChange();
			}
		);

		initPlugins(game);

		var physics = new Physics(player, inputHandler.state, game);
		var lines = new Lines(webgl.gl);
		var highlightOn = true;

		// add cube wireframe
		//lines.fill( Shapes.wire.cube([0,0,0], [1,1,1]) )
		//lines.fill( Shapes.wire.mesh([-32,0,-32], 96, 96) )


		var st = new Stats();
		st.domElement.style.position = 'absolute';
		st.domElement.style.bottom = '0px';
		document.body.appendChild(st.domElement);

		webgl.onRender(function(ts: any) {
			// what's the proper name for this matrix?
			// get inverse matrix from camera and pass to render() on other objects?
			if (!ts) {
				ts = 0;
			}

			// START of non-render stuff
			// Do these in sync with frame drawing so movement is smoother
			inputHandler.tick();
			// Wait until user clicks the canvas for the first time before we activate physics
			// Otherwise player may fall through the world before we get the the initial voxel data
			if (ready) {
				// physics will somehow update player position, and thus, the camera
				physics.tick();
			}
			// END of non-render stuff
			camera.updateProjection();

			sky.render(camera.inverse, ts);
			voxels.render(camera.inverse, ts, sky.ambientLightColor, sky.directionalLight);
			if (highlightOn) {
				// Highlight of targeted bock can be turned off with Shift
				lines.render(camera.inverse);
			}

			player.render(camera.inverse, ts);
			st.update();

			for (var id in players) {
				var pl = players[id];
				pl.model.render(camera.inverse, ts);
			}
		});

		player.translate(config.initialPosition);

		client.worker.postMessage(['createFrustum', camera.verticalFieldOfView, camera.ratio, camera.farDistance]);
		// regionChange() triggers loading of world chunks from the server
		client.regionChange();
		webgl.start();


		// Material to build with. The material picker dialog changes this value
		var currentMaterial: number = 1;
		// Holds coordinates of the voxel being looked at
		var currentVoxel: any = null;
		var currentNormalVoxel = pool.malloc('array', 3);

		// When doing bulk create/destroy, holds the coordinates of the start of the selected region
		var selectStart = pool.malloc('array', 3);

		fillMaterials(textures);

		// Show coordinates
		var elCoordinates = document.getElementById('coordinates');
		setInterval(function() {
			elCoordinates.innerHTML = player.getPosition().map(Math.floor).join(',') +
				'<br />' +
				game.lastRegion.join(',');
		}, 1000);


		// INPUT HANDLER SETUP
		inputHandler.mouseDeltaCallback(function(deltaX: any, deltaY: any) {
			// Can I do these at the same time? Maybe a new quat, rotated by vector, multiplied into existing?
			player.rotateY(-(deltaX / 200.0));
			// Don't pitch player, just the camera
			player.rotateX(-(deltaY / 200.0));
		});

		inputHandler.on('to.start', function() {
			var value;
			document.getElementById('overlay').className = 'introduction';

			// nickname
			value = localStorage.getItem('name');
			if (!value || value.length === 0 || value.trim().length === 0) {
				value = randomName();
				localStorage.setItem('name', value);
			}
			(<HTMLInputElement>document.getElementById('username')).value = value;

			// draw distance
			value = parseInt(localStorage.getItem('drawDistance'));
			if (!value) {
				value = 2;
				localStorage.setItem('drawDistance', '' + value);
			}
			(<HTMLInputElement>document.getElementById('drawDistance')).value = '' + value;

			//element.value = value;
			config.drawDistance = value;
			config.removeDistance = value + 1;
		});

		inputHandler.on('drawDistance', function(drawDistance: any) {
			var value = parseInt(drawDistance);
			if (value < 0) {
				value = 1;
			}
			localStorage.setItem('drawDistance', '' + value);

			config.drawDistance = value;
			config.removeDistance = value + 1;

			client.regionChange();
		});

		inputHandler.on('avatar', function(avatar: any) {
			client.avatar = avatar;
			player.setTexture(textures.byName[avatar]);
		});

		inputHandler.on('from.start', function() {
			// User has clicked the canvas to start playing. Let's activate physics now.
			ready = true;

			// Get name from input and store in localStorage
			var element = (<HTMLInputElement>document.getElementById('username'));
			var value = element.value.trim();
			if (value.length === 0) {
				value = randomName();
			}
			localStorage.setItem('name', value);
		});

		inputHandler.on('to.playing', function() {
			// hide intro
			var overlay = document.getElementById('overlay');
			overlay.className = '';
		});

		inputHandler.on('view', function() {
			camera.nextView();
		});

		inputHandler.on('shift', function() {
			highlightOn = (highlightOn ? false : true);
		});

		inputHandler.on('to.materials', function() {
			document.getElementById('overlay').className = 'textures';
		});

		inputHandler.on('from.materials', function() {
			document.getElementById('overlay').className = '';
		});


		// Creation / destruction
		var selecting = false;
		var low = pool.malloc('array', 3);
		var high = pool.malloc('array', 3);
		inputHandler.on('fire.down', function() {
			// Log current voxel we're pointing at
			if (currentVoxel) {
				selecting = true;
				selectStart[0] = currentVoxel[0];
				selectStart[1] = currentVoxel[1];
				selectStart[2] = currentVoxel[2];
			}
		});
		inputHandler.on('fire.up', function() {
			if (currentVoxel && selecting) {
				/*
				{
					chunkId: [index, value, index2, value2 ...],
					...
				}
				*/
				var chunkVoxelIndexValue = {};
				var touching = {};
				low[0] = Math.min(selectStart[0], currentVoxel[0]);
				low[1] = Math.min(selectStart[1], currentVoxel[1]);
				low[2] = Math.min(selectStart[2], currentVoxel[2]);
				high[0] = Math.max(selectStart[0], currentVoxel[0]);
				high[1] = Math.max(selectStart[1], currentVoxel[1]);
				high[2] = Math.max(selectStart[2], currentVoxel[2]);
				if (inputHandler.state.alt) {
					console.log('Does this get called anymore?');
					coordinates.lowToHighEach(
						low,
						high,
						function(i: number, j: number, k: any) {
							game.setBlock([i, j, k], currentMaterial, chunkVoxelIndexValue);
						}
					);
				} else {
					coordinates.lowToHighEach(
						low,
						high,
						function(i: number, j: number, k: any) {
							game.setBlock([i, j, k], 0, chunkVoxelIndexValue, touching);
						}
					);
				}

				client.worker.postMessage(['chunkVoxelIndexValue', chunkVoxelIndexValue, touching]);
			}
			selecting = false;
		});

		inputHandler.on('firealt.down', function() {
			// Log current voxel we're pointing at
			if (currentVoxel) {
				selecting = true;
				selectStart[0] = currentNormalVoxel[0];
				selectStart[1] = currentNormalVoxel[1];
				selectStart[2] = currentNormalVoxel[2];
			}
		});
		inputHandler.on('firealt.up', function() {
			// TODO: clean this up so we use the object pool for these arrays
			if (currentVoxel && selecting) {
				var chunkVoxelIndexValue = {};
				low[0] = Math.min(selectStart[0], currentNormalVoxel[0]);
				low[1] = Math.min(selectStart[1], currentNormalVoxel[1]);
				low[2] = Math.min(selectStart[2], currentNormalVoxel[2]);
				high[0] = Math.max(selectStart[0], currentNormalVoxel[0]);
				high[1] = Math.max(selectStart[1], currentNormalVoxel[1]);
				high[2] = Math.max(selectStart[2], currentNormalVoxel[2]);
				if (currentMaterial === 305) {
					var getRandomInt = function(min: number, max: number) {
						return Math.floor(Math.random() * (max - min)) + min;
					};
					coordinates.lowToHighEach(
						low,
						high,
						function(i: number, j: number, k: any) {
							var treeTypes = ['subspace', 'guybrush'];
							var treeType = getRandomInt(0, 2);
							trees({
								position: {
									x: i,
									y: j,
									z: k
								},
								setBlock: function(position: any, material: any) {
									game.setBlock([position.x, position.y, position.z], material, chunkVoxelIndexValue);
								},
								treeType: treeTypes[treeType],
								bark: 24,
								leaves: 100
							});
						}
					);

				} else {
					coordinates.lowToHighEach(
						low,
						high,
						function(i: number, j: number, k: any) {
							game.setBlock([i, j, k], currentMaterial, chunkVoxelIndexValue);
						}
					);
				}

				client.worker.postMessage(['chunkVoxelIndexValue', chunkVoxelIndexValue]);
			}
			selecting = false;
		});

		inputHandler.on('currentMaterial', function(c: any) {
			currentMaterial = c;
		});

		inputHandler.on('chat', function(message: any) {
			var out = {
				user: localStorage.getItem('name'),
				text: message
			};
			client.worker.postMessage(['chat', out]);
		});

		inputHandler.transition('start');

		client.on('close', function() {
			inputHandler.transition('disconnected');
		});


		// This needs cleanup, and encapsulation, but it works
		var voxelHit = pool.malloc('array', 3);
		var voxelNormal = pool.malloc('array', 3);
		var distance = 10;
		var direction = vec3.create();
		var pointer = function() {
			var hit;
			direction[0] = direction[1] = 0;
			direction[2] = -1;
			vec3.transformQuat(direction, direction, player.getRotationQuat());
			hit = raycast(game, camera.getPosition(), direction, distance, voxelHit, voxelNormal);
			if (hit > 0) {
				voxelHit[0] = Math.floor(voxelHit[0]);
				voxelHit[1] = Math.floor(voxelHit[1]);
				voxelHit[2] = Math.floor(voxelHit[2]);

				// Give us access to the current voxel and the voxel at it's normal
				currentVoxel = voxelHit;
				currentNormalVoxel[0] = voxelHit[0] + voxelNormal[0];
				currentNormalVoxel[1] = voxelHit[1] + voxelNormal[1];
				currentNormalVoxel[2] = voxelHit[2] + voxelNormal[2];

				if (selecting) {
					if (inputHandler.state.alt || inputHandler.state.firealt) {
						low[0] = Math.min(selectStart[0], currentNormalVoxel[0]);
						low[1] = Math.min(selectStart[1], currentNormalVoxel[1]);
						low[2] = Math.min(selectStart[2], currentNormalVoxel[2]);
						high[0] = Math.max(selectStart[0] + 1, currentNormalVoxel[0] + 1);
						high[1] = Math.max(selectStart[1] + 1, currentNormalVoxel[1] + 1);
						high[2] = Math.max(selectStart[2] + 1, currentNormalVoxel[2] + 1);
					} else {
						low[0] = Math.min(selectStart[0], currentVoxel[0]);
						low[1] = Math.min(selectStart[1], currentVoxel[1]);
						low[2] = Math.min(selectStart[2], currentVoxel[2]);
						high[0] = Math.max(selectStart[0] + 1, currentVoxel[0] + 1);
						high[1] = Math.max(selectStart[1] + 1, currentVoxel[1] + 1);
						high[2] = Math.max(selectStart[2] + 1, currentVoxel[2] + 1);
					}
					lines.fill(Shapes.wire.cube(low, high));
				} else {
					if (inputHandler.state.alt || inputHandler.state.firealt) {
						high[0] = currentNormalVoxel[0] + 1;
						high[1] = currentNormalVoxel[1] + 1;
						high[2] = currentNormalVoxel[2] + 1;
						lines.fill(Shapes.wire.cube(currentNormalVoxel, high));
					} else {
						high[0] = currentVoxel[0] + 1;
						high[1] = currentVoxel[1] + 1;
						high[2] = currentVoxel[2] + 1;
						lines.fill(Shapes.wire.cube(currentVoxel, high));
					}
				}
				lines.skip(false);
			} else {
				// clear
				lines.skip(true);
				currentVoxel = null;
			}
		};


		// INTERVAL CALLBACKS NOT TIED TO FRAMERATE
		// 60 calls per second
		setInterval(function() {
			game.tick();

			//other.tick()
			pointer();

			// Update player positions
			for (var id in players) {
				var player = players[id];
				var summed = 0;
				for (var i = 0; i < player.adjustments.length; i++) {
					player.current[i] += player.adjustments[i];
					summed += Math.abs(player.adjustments[i]);
				}
				player.model.setTranslation(
					player.current[0],
					player.current[1],
					player.current[2]
				);
				player.model.setRotation(
					player.current[3],
					player.current[4],
					player.current[5]
				);
				player.model.isMoving = (summed > 0.05);
			}

			// TODO: calculate delta in webgl render callback and move sky.tick there
			sky.tick(6);
			// What if we call this 30 times a second instead?
		}, 1000 / 60);
	};
	//Game3
	textures.load(webgl.gl, initGame);

	var initPlugins = function(game: Game) {
		return;
		/*var mine = voxelMine(game, {});

		mine.on('break', function(target: any) {
			console.log(target);
		});*/

		/*
		var plugins = voxelPlugins(game, {
			'require': require
		});
		plugins.add('voxel-carry', {});
		plugins.add('voxel-shader', {});
		plugins.add('voxel-keys', {});
		plugins.add('voxel-registry', {});
		plugins.add('game-shell-fps-camera', {});
		plugins.add('voxel-inventory-hotbar', {});
		plugins.add('voxel-decals', {});
		plugins.add('voxel-mesher', {});
		plugins.add('voxel-stitch', {});
		plugins.add('voxel-reach', {});
		plugins.add('voxel-mine', {});
		plugins.loadAll();
		 * */
	};
});


setInterval(
	function() {
		timer.print();
	},
	10000
);
