var config = require('../config');
var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;
var chunkSize = config.chunkSize;
//console.log('ChunkSize', chunkSize);
var randomName = require('sillyname');
var WebSocketEmitter = require('../shared/web-socket-emitter');

//import {Game} from './lib/game3';
var createEngine = require('../shared/voxel-engine-stackgl');//require('voxel-engine-stackgl');
var WebSocketStream = require('websocket-stream');
//import {VoxelingClient} from './lib/voxeling-client';
//import {InputHandler} from './lib/client-input';
import {Player} from './lib/player';
import {Textures} from './lib/textures';
import {WebGL} from './lib/webgl';
import {VoxelClient} from './lib/voxel-client';
/*
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
*/
//var voxelInventoryHotbar = require('voxel-inventory-hotbar');
//var voxelRegistry = require('voxel-registry');
//var voxelDecals = require('voxel-decals');
//var voxelMesher = require('voxel-mesher');
//var voxelStitch = require('voxel-stitch');
//var voxelReach = require('voxel-reach');
//var voxelMine = require('voxel-mine');
//var voxelCarry = require('voxel-carry');
//var voxelKeys = require('voxel-keys');
//var voxelShader = require('voxel-shader');
//var kbBindings = require('kb-bindings');
//var gameShellFPSCamera = require('game-shell-fps-camera');

/*
//var voxelDebris = require('voxel-debris');
var voxelTrees = require('voxel-trees');
var kbBindings = require('kb-bindings');
var voxelkbBindingsUI = require('kb-bindings-ui');
var voxelDebug = require('voxel-debug');
var datGUI = require('dat-gui');
 * */

//var coordinates = new Coordinates(chunkSize);
//var client = new VoxelingClient(config);
var textures: Textures;

var players: any = {};
console.log(1289);


/*wsclient.on('close', function() {
	document.getElementById('overlay').className = 'disconnected';
});

wsclient.on('players', function(others: any) {
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

wsclient.on('settings', function (a: any) {
*/
var initGame = function() {
	console.log(1);
	var wsclient = new WebSocketEmitter.client();
	wsclient.connect(config.server);
	//var duplexStream = new WebSocketStream(wsclient);
	var duplexStream = wsclient;

	console.log(2);

	var canvas = (<HTMLCanvasElement>document.getElementById('herewego'));
	//var inputHandler = new InputHandler(document.body, canvas);

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	// or emit your own events back to the server!
	// Note: to have the server forward the event to all players,
	// add the event name to `server.forwardEvents`
	//client.connection.emit('attack', attackDetails);
	// Wait until textures have fully loaded

	console.log(4);
	return createEngine({
		exposeGlobal: true,
		pluginLoaders: {
			'voxel-client' : require('./lib/voxel-client'),
			'voxel-artpacks': require('voxel-artpacks'),
			'voxel-wireframe': require('voxel-wireframe'),
			'voxel-chunkborder': require('voxel-chunkborder'),
			'voxel-outline': require('voxel-outline'),
			'voxel-carry': require('voxel-carry'),
			'voxel-bucket': require('voxel-bucket'),
			'voxel-fluid': require('voxel-fluid'),
			'voxel-skyhook': require('voxel-skyhook'),
			'voxel-bedrock': require('voxel-bedrock'),
			'voxel-recipes': require('voxel-recipes'),
			'voxel-quarry': require('voxel-quarry'),
			'voxel-measure': require('voxel-measure'),
			'voxel-webview': require('voxel-webview'),
			'voxel-vr': require('voxel-vr'),
			'voxel-workbench': require('voxel-workbench'),
			'voxel-furnace': require('voxel-furnace'),
			'voxel-chest': require('voxel-chest'),
			'voxel-inventory-hotbar': require('voxel-inventory-hotbar'),
			'voxel-inventory-crafting': require('voxel-inventory-crafting'),
			'voxel-voila': require('voxel-voila'),
			'voxel-health': require('voxel-health'),
			'voxel-health-bar': require('voxel-health-bar'),
			//'voxel-health-fall': require('voxel-health-fall'); // TODO: after https://github.com/deathcap/voxel-health-fall/issues/1
			'voxel-food': require('voxel-food'),
			'voxel-scriptblock': require('voxel-scriptblock'),
			'voxel-sfx': require('voxel-sfx'),
			'voxel-flight': require('voxel-flight'),
			'voxel-gamemode': require('voxel-gamemode'),
			'voxel-sprint': require('voxel-sprint'),
			'voxel-decals': require('voxel-decals'),
			'voxel-mine': require('voxel-mine'),
			'voxel-harvest': require('voxel-harvest'),
			'voxel-use': require('voxel-use'),
			'voxel-reach': require('voxel-reach'),
			'voxel-pickaxe': require('voxel-pickaxe'),
			'voxel-hammer': require('voxel-hammer'),
			'voxel-wool': require('voxel-wool'),
			'voxel-pumpkin': require('voxel-pumpkin'),
			'voxel-blockdata': require('voxel-blockdata'),
			'voxel-glass': require('voxel-glass'),
			//'voxel-land': require('voxel-land'),
			//'voxel-flatland': require('voxel-flatland'),
			'voxel-decorative': require('voxel-decorative'),
			'voxel-inventory-creative': require('voxel-inventory-creative'),
			'voxel-console': require('voxel-console'),
			'voxel-commands': require('voxel-commands'),
			'voxel-drop': require('voxel-drop'),
			'voxel-zen': require('voxel-zen'),
			'camera-debug': require('camera-debug'),
			'voxel-plugins-ui': require('voxel-plugins-ui'),
			'voxel-fullscreen': require('voxel-fullscreen'),
			'voxel-keys': require('voxel-keys'),
			'kb-bindings-ui': require('kb-bindings-ui')
		},
		pluginOpts: {
			'voxel-client':{
				serverStream: duplexStream
			},
			'voxel-engine-stackgl': {
				appendDocument: true,
				exposeGlobal: true,  // for debugging

				lightsDisabled: true,
				arrayTypeSize: 2,  // arrayType: Uint16Array
				useAtlas: true,
				generateChunks: false,
				chunkDistance: 2,
				worldOrigin: [0, 0, 0],
				controls: {
					discreteFire: false,
					fireRate: 100, // ms between firing
					jumpTimer: 25
				},
				keybindings: {
					// voxel-engine defaults
					'W': 'forward',
					'A': 'left',
					'S': 'backward',
					'D': 'right',
					'<up>': 'forward',
					'<left>': 'left',
					'<down>': 'backward',
					'<right>': 'right',
					'<mouse 1>': 'fire',
					'<mouse 3>': 'firealt',
					'<space>': 'jump',
					'<shift>': 'crouch',
					'<control>': 'alt',
					'<tab>': 'sprint',

					// our extras
					'F5': 'pov',
					'O': 'home',
					'E': 'inventory',

					'T': 'console',
					'/': 'console2',
					'.': 'console3',

					'P': 'packs',

					'F1': 'zen'
				}
			},

			// built-in plugins
			'voxel-registry': {},
			'voxel-stitch': {
				artpacks: ['ProgrammerArt-ResourcePack.zip'],
				verbose:false
			},
			'voxel-shader': {
				//cameraFOV: 45,
				//cameraFOV: 70,
				cameraFOV: 90
				//cameraFOV: 110,
			},

			'voxel-mesher': {},
			'game-shell-fps-camera': {
				position: [0, -100, 0]
			},

			'voxel-artpacks': {},
			'voxel-wireframe': {},
			'voxel-chunkborder': {},
			'voxel-outline': {},
			'voxel-recipes': {},
			'voxel-quarry': {},
			'voxel-measure': {},
			'voxel-webview': {},
			'voxel-vr': {onDemand: true}, // has to be enabled after gl-init to replace renderer
			'voxel-carry': {},
			'voxel-bucket': {fluids: ['water', 'lava']},
			'voxel-fluid': {},
			//'voxel-virus': {materialSource: 'water', material: 'waterFlow', isWater: true}, // requires this.game.materials TODO: water
			'voxel-skyhook': {},
			'voxel-bedrock': {},
			'voxel-blockdata': {},
			'voxel-chest': {},
			'voxel-workbench': {},
			'voxel-furnace': {},
			'voxel-pickaxe': {},
			'voxel-hammer': {},
			'voxel-wool': {},
			'voxel-pumpkin': {},

			'voxel-glass': {},
			//'voxel-land': {populateTrees: true},
			//'voxel-flatland': { block: 'bedrock', onDemand: false},
			'voxel-decorative': {},
			'voxel-inventory-creative': {},
			//'voxel-clientmc': {url: 'ws://localhost:1234', onDemand: true}, // TODO

			'voxel-console': {},
			'voxel-commands': {},
			'voxel-drop': {},
			'voxel-zen': {},

			//'voxel-player': {image: 'player.png', homePosition: [2,14,4], homeRotation: [0,0,0]}, // three.js TODO: stackgl avatar
			'voxel-health': {},
			'voxel-health-bar': {},
			//'voxel-health-fall': {}, // requires voxel-player TODO: enable and test
			'voxel-food': {},
			'voxel-scriptblock': {},
			'voxel-sfx': {},
			'voxel-flight': {flySpeed: 0.8, onDemand: true},
			'voxel-gamemode': {},
			'voxel-sprint': {},
			'voxel-inventory-hotbar': {inventorySize: 10, wheelEnable: true},
			'voxel-inventory-crafting': {},
			'voxel-reach': {reachDistance: 8},
			'voxel-decals': {},
			// left-click hold to mine
			'voxel-mine': {
				instaMine: false,
				progressTexturesPrefix: 'destroy_stage_',
				progressTexturesCount: 9
			},
			// right-click to place block (etc.)
			'voxel-use': {},
			// handles 'break' event from voxel-mine (left-click hold breaks blocks), collects block and adds to inventory
			'voxel-harvest': {},
			'voxel-voila': {},
			'voxel-fullscreen': {},
			'voxel-keys': {},

			// the GUI window (built-in toggle with 'H')
			//'voxel-debug': {}, // heavily three.js dependent TODO: more debugging options for stackgl-based engine besides camera?
			'camera-debug': {}, // TODO: port from game-shell-fps-camera
			'voxel-plugins-ui': {},
			'kb-bindings-ui': {}
		}
	});
};
initGame();

setInterval(
	function() {
		//timer.print();
	},
	10000
);
