"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// external dependencies
var config = require('../config');
var path = require('path');
var extend = require('extend');
var ndarray = require('ndarray');
const events_1 = require("events");
const voxel_server_1 = require("./voxel-server");
// internal dependencies
//var modvox = require('./features/modvox/server.js');
//var entity = require('./features/entity/server.js');
class GameServer extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.connectionLimit = 10;
        // force instantiation via `new` keyword
        this.initialize(opts);
    }
    connectClient(duplexStream) {
        var self = this;
        self.baseServer.connectClient(duplexStream);
        console.log(duplexStream.id, 'join');
    }
    removeClient(duplexStream) {
        var self = this;
        self.baseServer.removeClient(duplexStream);
        console.log(duplexStream.id, 'left');
    }
    //
    // Private
    //
    initialize(opts) {
        var self = this;
        // for debugging
        var defaults = {
            generateChunks: false,
            chunkDistance: 2,
            materials: [
                ['grass', 'dirt', 'grass_dirt'],
                'dirt',
                'plank',
                'cobblestone',
                'brick',
                'bedrock',
                'glowstone',
                'netherrack',
                'obsidian',
                'diamond',
                'whitewool',
                'redwool',
                'bluewool',
            ],
            avatarInitialPosition: [2, 20, 2],
            forwardEvents: ['spatialTrigger'],
        };
        var settings = self.settings = extend({}, defaults, opts);
        // get database
        // enable event forwarding for features
        //settings.forwardEvents.push('modvox');
        //settings.forwardEvents.push('entity');
        // create and initialize base game server
        var baseServer = self.baseServer = new voxel_server_1.voxelServer(settings);
        self.game = baseServer.game;
        // sane defaults
        self.spatialTriggers = [];
        // expose emitter methods on client
        // add features
        //modvox(self);
        //entity(self);
        self.bindEvents();
    }
    bindEvents() {
        var self = this;
        var settings = self.settings;
        var baseServer = self.baseServer;
        var game = self.game;
        // setup spatial triggers
        self.setupSpatialTriggers();
        // setup world CRUD handlers
        baseServer.on('missingChunk', function (position, complete) {
            var cs = self.game.chunkSize;
            var dimensions = [cs, cs, cs];
            var chunk = {
                position: position,
                voxels: self.getFlatChunkVoxels(position),
                dims: dimensions,
            };
            chunk.length = chunk.voxels.length;
            self.game.showChunk(chunk);
            self.emit('chunkLoaded', chunk);
        });
        baseServer.on('set', function (pos, val) {
            var chunk = game.getChunkAtPosition(pos);
            //storeChunk(chunk);
        });
        // trigger world load and emit 'ready' when done
        var loadedChunks = 0;
        var expectedNumberOfInitialChunks = Math.pow(self.game.voxels.distance * 2, 3); // (2*2)^3=64 from [-2,-2,-2] --> [1,1,1]
        self.on('chunkLoaded', function (chunk) {
            loadedChunks++;
            // TODO: ideally would unsub if this condition is true
            if (loadedChunks === expectedNumberOfInitialChunks) {
                self.emit('ready');
            }
        });
        game.voxels.requestMissingChunks(game.worldOrigin);
        // log chat
        baseServer.on('chat', function (message) {
            console.log('chat - ', message);
        });
        // handle errors
        baseServer.on('error', function (error) {
            console.log('error - error caught in server:');
            console.log(error.stack);
        });
        // store chunk in db
        /*function storeChunk(chunk: any) {
            self.voxelDb.store(settings.worldId, chunk, function afterStore(err: any) {
                if (err) {
                    console.error('chunk store error', err.stack);
                }
            });
        }*/
    }
    setupSpatialTriggers() {
        var self = this;
        var baseServer = self.baseServer;
        // get modvoxes from db
        /*self.voxelDb.db.get('spatialTriggers', function(err: any, val: any) {
            self.spatialTriggers = val ? JSON.parse(val) : [];
        });*/
        // set modvox
        baseServer.on('spatialTrigger', function (spatialTrigger) {
            // add to list
            self.spatialTriggers.push(spatialTrigger);
            updateSpatialTriggerStore();
        });
        // send spatialTriggers on join
        baseServer.on('client.join', function (client) {
            console.log('client.join');
            self.spatialTriggers.map(function (spatialTrigger) {
                client.connection.emit('spatialTrigger', spatialTrigger);
            });
        });
        // store spatialTriggers
        function updateSpatialTriggerStore() {
            //self.voxelDb.db.put('spatialTriggers', JSON.stringify(self.spatialTriggers));
        }
    }
    getFlatChunkVoxels(position) {
        var material = 11;
        if (position[1] > 0) {
            material = 0;
        }
        var chunkSize = 32;
        var width = chunkSize;
        var pad = 4;
        var arrayType = Uint8Array;
        var chunkSizem = width - 1;
        var buffer = new ArrayBuffer((width + pad) * (width + pad) * (width + pad) * arrayType.BYTES_PER_ELEMENT);
        var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
        var h = pad >> 1;
        var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);
        var b = 0;
        for (var x = 0; x < width; ++x) {
            for (var z = 0; z < width; ++z) {
                for (var y = 0; y < width; ++y) {
                    b++;
                    if ((x == 0 || x == chunkSizem || z == 0 || z == chunkSizem) && (y == 0 || y == chunkSizem)) {
                        voxels.set(x, y, z, 37);
                    }
                    else if (position[1] == 0 && y == 0) {
                        voxels.set(x, y, z, material);
                    }
                    else {
                        voxels.set(x, y, z, 0);
                    }
                }
            }
        }
        voxelsPadded.position = position;
        return voxelsPadded;
    }
}
exports.GameServer = GameServer;