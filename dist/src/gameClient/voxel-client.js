"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// dependencies;
const events_1 = require("events");
var duplexEmitter = require('duplex-emitter');
var extend = require('extend');
var crunch = require('voxel-crunch');
var ndarray = require('ndarray');
//var THREE = require('THREE');
const avatar_view_1 = require("./avatar-view");
//var voxelPlayer = require('voxel-player');
//var skin = require('minecraft-skin');
var glm = require('gl-matrix');
module.exports = (game, opts) => new VoxelClient(game, opts);
module.exports.pluginInfo = {
    loadAfter: ['voxel-console']
};
class VoxelClient extends events_1.EventEmitter {
    constructor(game, opts) {
        super();
        this.currentState = {};
        this.isReady = false;
        var self = this;
        self.opts = opts;
        self.game = game;
        self.texturePath = opts.texturePath || '/textures/';
        self.playerTexture = opts.playerTexture || 'player.png';
        self.lerpPercent = 0.1;
        self.remoteClients = {};
        self.connection = new events_1.EventEmitter();
        opts.getConnection(function (connection) {
            //todo deal with proper connection a startup for other plugins
            //self.connection = new EventEmitter();
            console.log('Connection initialised');
            self.connection = connection;
            self.bindEvents(self.connection);
            setTimeout(function () {
                self.connection.emit('created');
            }, 1000);
        });
    }
    scale(x, fromLow, fromHigh, toLow, toHigh) {
        return (x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
    }
    bindEvents(connection) {
        var self = this;
        connection.on('id', function (id) {
            console.log('receiving id', id);
            self.playerID = id;
        });
        connection.on('settings', function (settings) {
            console.log('receiving settings', settings);
            // set client-specific settings;
            settings.isClient = true;
            settings.texturePath = self.texturePath;
            settings.generateChunks = false;
            settings.controlsDisabled = false;
            // tell server we're ready;
            self.initGame(settings);
            connection.emit('created');
        });
        // load in chunks from the server;
        connection.on('chunk', function (encoded, meta) {
            // ensure `encoded` survived transmission as an array;
            // JSON stringifies Uint8Arrays as objects;
            if (encoded.length === undefined) {
                var lastIndex = Math.max.apply(null, Object.keys(encoded).map(Number));
                encoded.length = lastIndex + 1;
            }
            var chunk = ndarray(crunch.decode(encoded), meta.voxels.shape);
            chunk.position = meta.position;
            chunk.dims = meta.dims;
            self.game.showChunk(chunk);
        });
        // after all chunks loaded;
        connection.on('noMoreChunks', function () {
            console.log('noMoreChunks');
            var game = self.game;
            // if not capable, throw error;
            if (game.notCapable()) {
                try {
                    throw 'game not capable';
                }
                catch (err) {
                    self.emit('error', err);
                }
            }
            // tell modules consumers we're ready;
            self.emit('loadComplete');
        });
        // fires when server sends us voxel edits;
        connection.on('set', function (pos, val) {
            self.serverSettingBlock = true;
            self.game.setBlock(pos, val);
            self.serverSettingBlock = false;
        });
        // handle server updates;
        connection.on('update', function (updates) {
            if (!self.isReady) {
                return;
            }
            Object.keys(updates.positions).map(function (playerID) {
                var update = updates.positions[playerID];
                if (playerID === self.playerID) {
                    // local player;
                    self.onServerUpdate(update);
                    //self.updatePlayerPosition('uu',update);
                }
                else {
                    // other players;
                    self.updatePlayerPosition(playerID, update);
                }
            });
        });
        // handle removing clients that leave;
        connection.on('leave', function (id) {
            if (!self.remoteClients[id]) {
                return;
            }
            delete self.remoteClients[id];
        });
    }
    enable() {
        console.log('client enable');
    }
    disable() {
        console.log('client disable');
    }
    initGame(settings) {
        var self = this;
        var connection = self.connection;
        console.log('initGame');
        // retrieve name from local storage;
        var name = localStorage.getItem('name');
        // if no name, choose a random name;
        if (!name) {
            name = 'player name';
            localStorage.setItem('name', name);
        }
        self.name = name;
        // handle controls;
        self.game.controls.on('data', function (state) {
            //console.log('data',state);
            var interacting = false;
            Object.keys(state).map(function (control) {
                if (state[control] > 0) {
                    interacting = true;
                }
            });
            if (interacting) {
                self.sendState();
            }
        });
        self.game.voxels.on('missingChunk', function (pos) {
            console.log('missingChunk ask', pos, connection.readyState === connection.CLOSED);
            if (connection.readyState === connection.CLOSED) {
                //	return;
            }
            connection.emit('missingChunk', pos);
        });
        // send voxel edits;
        self.game.on('setBlock', function (pos, val) {
            if (self.serverSettingBlock) {
                return;
            }
            connection.emit('set', pos, val);
        });
        // delay is because three.js seems to throw errors if you add stuff too soon;
        setTimeout(function () {
            self.isReady = true;
        }, 1000);
        return self.game;
    }
    sendState() {
        var state = this.getNormalizedState(this.game.controls.target());
        let newState = JSON.stringify(state);
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.connection.emit('state', state);
        }
    }
    getNormalizedState(player) {
        return {
            p: {
                x: Math.round(player.yaw.position.x * 100) / 100,
                y: Math.round(player.yaw.position.y * 100) / 100,
                z: Math.round(player.yaw.position.z * 100) / 100
            },
            r: {
                y: Math.round(player.yaw.rotation.y * 200) / 200,
                x: Math.round(player.pitch.rotation.x * 200) / 200
            }
        };
    }
    onServerUpdate(update) {
        var self = this;
        //var state = this.getNormalizedState(self.game.controls.target());
    }
    lerpMe(position) {
        var self = this;
        var to = new glm.vec3();
        to.copy(position);
        var from = this.game.controls.target().yaw.position;
        from.copy(from.lerp(to, this.lerpPercent));
    }
    updatePlayerPosition(id, update) {
        var self = this;
        if (!self.remoteClients[id]) {
            self.remoteClients[id] = new avatar_view_1.avatarView(self.game);
            self.remoteClients[id].walk();
        }
        self.remoteClients[id].update(update);
        //playerMesh.children[0].rotation.y = update.r.y + (Math.PI / 2);
        //playerSkin.head.rotation.z = this.scale(update.r.x, -1.5, 1.5, -0.75, 0.75);
    }
}
exports.VoxelClient = VoxelClient;
