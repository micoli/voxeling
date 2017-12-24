"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require('../config');
const voxel_engine_stackgl_1 = require("../shared/voxel-engine-stackgl");
const web_socket_emitter_1 = require("../shared/web-socket-emitter");
function default_1() {
    var _canvas = document.getElementById('game-holder');
    _canvas.width = _canvas.clientWidth;
    _canvas.height = _canvas.clientHeight;
    try {
        window.voxelGame = new voxel_engine_stackgl_1.Game({
            exposeGlobal: true,
            require: function (module) {
                console.error('Could not use require with webpack here');
            },
            pluginLoaders: {
                'voxel-client': require('./voxel-client'),
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
                //'voxel-webview': require('voxel-webview'),
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
                'voxel-inventory-creative': require('voxel-inventory-creative'),
                'voxel-console': require('voxel-console'),
                'voxel-commands': require('voxel-commands'),
                'voxel-drop': require('voxel-drop'),
                'voxel-zen': require('voxel-zen'),
                'camera-debug': require('camera-debug'),
                'voxel-plugins-ui': require('voxel-plugins-ui'),
                'voxel-fullscreen': require('voxel-fullscreen'),
                'voxel-keys': require('voxel-keys'),
                'kb-bindings-ui': require('kb-bindings-ui'),
                'voxel-decorative': require('voxel-decorative'),
                'voxel-player': require('voxel-player'),
            },
            pluginOpts: {
                'voxel-client': {
                    getConnection: function (init) {
                        var connection = new web_socket_emitter_1.Client();
                        connection.on('open', function () {
                            console.log('websocket opened, init');
                            init(connection);
                        });
                        connection.on('close', function () {
                            console.log('websocket close');
                        });
                        connection.on('error', function (message) {
                            console.log('websocket error');
                        });
                        connection.connect(config.server);
                    }
                },
                'voxel-engine-stackgl': {
                    appendDocument: false,
                    exposeGlobal: true,
                    container: _canvas,
                    lightsDisabled: true,
                    arrayTypeSize: Uint8Array.BYTES_PER_ELEMENT,
                    useAtlas: true,
                    generateChunks: false,
                    chunkDistance: 2,
                    worldOrigin: [0, 0, 0],
                    controls: {
                        discreteFire: false,
                        fireRate: 100,
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
                        '<tab>': 'pov',
                        // our extras
                        'F5': 'sprint',
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
                    artpacks: ['static/ProgrammerArt-ResourcePack.zip'],
                    verbose: false
                },
                'voxel-shader': {
                    //cameraFOV: 45,
                    //cameraFOV: 70,
                    cameraFOV: 90
                    //cameraFOV: 110,
                },
                'voxel-mesher': {},
                'game-shell-fps-camera': {
                    position: [0, -50, 0]
                },
                'voxel-artpacks': {},
                'voxel-wireframe': {},
                'voxel-chunkborder': {},
                'voxel-outline': {},
                'voxel-recipes': {},
                'voxel-quarry': {},
                'voxel-measure': {},
                //'voxel-webview': {},
                'voxel-vr': { onDemand: true },
                'voxel-carry': {},
                'voxel-bucket': { fluids: ['water', 'lava'] },
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
                'voxel-decorative': {},
                'voxel-inventory-creative': {},
                //'voxel-clientmc': {url: 'ws://localhost:1234', onDemand: true}, // TODO
                'voxel-console': {},
                'voxel-commands': {},
                'voxel-drop': {},
                'voxel-zen': {},
                'voxel-player': { image: 'player.png', homePosition: [2, 14, 4], homeRotation: [0, 0, 0] },
                'voxel-health': {},
                'voxel-health-bar': {},
                //'voxel-health-fall': {}, // requires voxel-player TODO: enable and test
                'voxel-food': {},
                'voxel-scriptblock': {},
                'voxel-sfx': {},
                'voxel-flight': { flySpeed: 0.8, onDemand: true },
                'voxel-gamemode': {},
                'voxel-sprint': {},
                'voxel-inventory-hotbar': { inventorySize: 10, wheelEnable: true },
                'voxel-inventory-crafting': {},
                'voxel-reach': { reachDistance: 8 },
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
                'camera-debug': {},
                'voxel-plugins-ui': {},
                'kb-bindings-ui': {},
            }
        });
    }
    catch (e) {
        console.log(e);
        eval('debugger');
    }
}
exports.default = default_1;
