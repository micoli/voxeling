"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// dependencies
const events_1 = require("events");
var DuplexEmitter = require('duplex-emitter');
var extend = require('extend');
var path = require('path');
var uuid = require('hat');
// voxel dependencies
var voxel = require('voxel');
var crunch = require('voxel-crunch');
var engine = require('voxel-engine');
var ndarray = require('ndarray');
class voxelServer extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.settings = {};
        this.game = {};
        this.chunkCache = {};
        this.forwardEvents = [];
        this.clients = {};
        this.initialize(opts);
    }
    initialize(opts) {
        var self = this;
        // server game settings are sent to all
        // new clients when they connect
        var defaults = {
            isClient: false,
            chunkDistance: 2,
            materials: [
                ['grass', 'dirt', 'grass_dirt'],
                'obsidian',
                'brick',
                'grass'
            ],
            worldOrigin: [0, 0, 0],
            controls: { discreteFire: true },
            avatarInitialPosition: [2, 120, 2],
            forwardEvents: [],
        };
        var settings = self.settings = extend({}, defaults, opts);
        // prepare a server object to return
        self.forwardEvents = settings.forwardEvents;
        var game = self.game = engine(settings);
        var clients = self.clients = {};
        var chunkCache = self.chunkCache = {};
        setInterval(self.handleErrors(function () {
            self.sendUpdate();
        }), 1000 / 22); // every 45ms
        // forward some events to module consumer
        game.voxels.on('missingChunk', function (chunk) { self.emit('missingChunk', chunk); });
    }
    // Setup the client connection - register events, etc
    connectClient(duplexStream) {
        var self = this;
        var settings = self.settings;
        var game = self.game;
        // create 'connection' remote event emitter from duplex stream
        var connection = (duplexStream);
        // register client id
        var id = uuid();
        connection.id = duplexStream.id = id;
        self.broadcast(id, 'join', id);
        var client = self.clients[id] = {
            id: id,
            connection: connection,
            player: {
                rotation: new game.THREE.Vector3(),
                position: new game.THREE.Vector3(),
            },
        };
        // setup client response handlers
        self.bindClientEvents(client);
        // send client id and initial game settings
        connection.emit('id', id);
        connection.emit('settings', settings);
        console.log('id and settings emmited');
    }
    removeClient(duplexStream) {
        var self = this;
        var id = duplexStream.id;
        var client = self.clients[id];
        delete self.clients[id];
        self.broadcast(id, 'leave', id);
    }
    bindClientEvents(client) {
        var self = this;
        var game = self.game;
        var id = client.id;
        var connection = client.connection;
        // forward chat message
        connection.on('data', function (message) {
            //console.log('ici data', message);
        });
        connection.on('chat', self.handleErrors(function (message) {
            console.log('ici chat');
            // ignore if no message provided
            if (!message.text)
                return;
            // limit chat message length
            if (message.text.length > 140)
                message.text = message.text.substr(0, 140);
            self.broadcast(null, 'chat', message);
        }));
        // when user ready ( game created, etc )
        connection.on('created', self.handleErrors(function () {
            // send initial world payload
            self.sendInitialChunks(connection);
            // emit client.created for module consumers
            self.emit('client.created', client);
        }));
        // client sends new position, rotation
        connection.on('state', self.handleErrors(function (state) {
            client.player.rotation.x = state.rotation.x;
            client.player.rotation.y = state.rotation.y;
            var pos = client.player.position;
            var distance = pos.distanceTo(state.position);
            if (distance > 20) {
                var before = pos.clone();
                pos.lerp(state.position, 0.1);
                return;
            }
            pos.copy(state.position);
            self.emit('client.state', client, state);
        }));
        // client modifies a block
        var chunkCache = self.chunkCache;
        connection.on('set', self.handleErrors(function (pos, val) {
            game.setBlock(pos, val);
            var chunkPos = game.voxels.chunkAtPosition(pos);
            var chunkID = chunkPos.join('|');
            if (chunkCache[chunkID])
                delete chunkCache[chunkID];
            // broadcast 'set' to all players
            self.broadcast(null, 'set', pos, val, client.id);
        }));
        // forward custom events
        self.forwardEvents.map(function (eventName) {
            connection.on(eventName, function () {
                var args = [].slice.apply(arguments);
                // add event name
                args.unshift(eventName);
                // add client id
                args.unshift(id);
                self.broadcast.apply(self, args);
            });
        });
    }
    // send message to all clients
    broadcast(id, ...args) {
        var self = this;
        // normalize arguments
        //var args = [].slice.apply(arguments)
        // remove client `id` argument
        //args.shift()
        // emit on self for module consumers, unless specified not to
        if (id !== 'server')
            self.emit.apply(self, args);
        Object.keys(self.clients).map(function (clientId) {
            if (clientId === id)
                return;
            var connection = self.clients[clientId].connection;
            // emit over connection
            connection.emit.apply(connection, args);
        });
    }
    // broadcast position, rotation updates for each player
    sendUpdate() {
        var self = this;
        var clientIds = Object.keys(self.clients);
        if (clientIds.length === 0)
            return;
        var update = {
            positions: {},
            date: +new Date()
        };
        clientIds.map(function (id) {
            var client = self.clients[id];
            update.positions[id] = {
                position: client.player.position,
                rotation: {
                    x: client.player.rotation.x,
                    y: client.player.rotation.y,
                },
            };
        });
        self.broadcast(null, 'update', update);
    }
    // send all the game chunks
    sendInitialChunks(connection) {
        var self = this;
        var chunks = self.game.voxels.chunks;
        var chunkCache = self.chunkCache;
        Object.keys(chunks).map(function (chunkID) {
            var chunk;
            if (chunks.hasOwnProperty(chunkID)) {
                chunk = chunks[chunkID];
            }
            else {
                console.log('no chunk');
                //chunk=self.getFlatChunkVoxels(chunk.position);
            }
            //chunk.voxels = self.getFlatChunkVoxels(chunk.position);
            chunk.dims = [34, 34, 34];
            var encoded = chunkCache[chunkID];
            if (!encoded) {
                try {
                    encoded = crunch.encode(chunk.voxels.data);
                }
                catch (e) {
                    console.log(e);
                }
                chunkCache[chunkID] = encoded;
            }
            connection.emit('chunk', encoded, {
                position: chunk.position,
                dims: chunk.dims,
                voxels: {
                    length: chunk.voxels.data.length,
                    shape: chunk.voxels.shape,
                    stride: chunk.voxels.stride,
                    offset: chunk.voxels.offset
                }
            });
        });
        connection.emit('noMoreChunks', true);
    }
    getFlatChunkVoxels(position) {
        var material = 37;
        if (position[1] > 0) {
            material = 0;
        }
        var chunkSize = 32;
        var width = chunkSize;
        var pad = 4;
        var arrayType = Uint8Array;
        var chunkSizem = width - 1;
        //var buffer = new ArrayBuffer((width) * (width) * (width) * arrayType.BYTES_PER_ELEMENT);
        var buffer = new ArrayBuffer((width + pad) * (width + pad) * (width + pad) * arrayType.BYTES_PER_ELEMENT);
        var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
        var h = pad >> 1;
        var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);
        var b = 0;
        for (var x = 0; x < width; ++x) {
            for (var z = 0; z < width; ++z) {
                for (var y = 0; y < width; ++y) {
                    b++;
                    //voxels.set(x, y, z, (b%3==0)?0:material);
                    if ((x == 0 || x == chunkSizem || z == 0 || z == chunkSizem) && (y == 0 || y == chunkSizem)) {
                        voxels.set(x, y, z, 74);
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
    // utility function
    // returns the provided function wrapped in a try-catch
    // emits errors to module consumer
    handleErrors(func) {
        var self = this;
        return function () {
            try {
                return func.apply(this, arguments);
            }
            catch (error) {
                self.emit('error', error);
            }
        };
    }
}
exports.voxelServer = voxelServer;
