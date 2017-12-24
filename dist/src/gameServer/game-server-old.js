"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import {FileChunkStore} from './lib/chunk-stores/file';
//import {MysqlChunkStore} from './lib/chunk-stores/mysql';
//var chunkGenerator = require('../shared/generators/server-terraced');
//import {VoxelStats} from './lib/voxel-stats';
var config = require('../config');
var debug = false;
const events_1 = require("events");
var WebSocketEmitter = require('../shared/web-socket-emitter');
var DuplexEmitter = require('duplex-emitter');
var extend = require('extend');
var path = require('path');
var uuid = require('hat');
var glm = require('gl-matrix');
var vec3 = glm.vec3;
var crunch = require('voxel-crunch');
const voxel_engine_stackgl_1 = require("../shared/voxel-engine-stackgl");
process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    //process.exit(1);
});
var connectionLimit = config.maxPlayers;
class GameServer extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.connections = 0;
        var self = this;
        var settings = self.settings = extend({}, opts);
        // prepare a server object to return
        self.forwardEvents = settings.forwardEvents || [];
        var clients = self.clients = {};
        var chunkCache = self.chunkCache = {};
        /*if (self.game.notCapable()) {
            return;
        }*/
        // send player position/rotation updates
        ////////setInterval(self.sendUpdate.bind(self), 1000 / 22); // every 45ms
        // forward some events to module consumer
        this.initWSServer();
        setTimeout(function () {
            self.createGame.call(self);
            self.game.voxels.on('missingChunk', function (chunk) {
                self.emit('missingChunk', chunk);
            });
        }, 2000);
    }
    initWSServer() {
        var self = this;
        var wseServer = new WebSocketEmitter.server({
            host: config.websocketBindAddress,
            port: config.websocketBindPort
        });
        wseServer.on('error', function (error) {
            console.log(error);
        });
        wseServer.on('connection', function (connection) {
            //VoxelStats.count('connections.incoming');
            // Have we reached our player max?
            var ts = new Date();
            console.log(ts.toUTCString(), 'Incoming client connection');
            self.connections++;
            console.log('Connections: ' + self.connections);
            connection.on('close', function () {
                self.connections--;
                var ts = new Date();
                console.log(ts.toUTCString(), 'Connections: ' + self.connections);
            });
            if (self.connections > connectionLimit) {
                console.log('Denying connection, at our limit');
                connection.close();
                return;
            }
            self.connectClient(connection, 'a' + self.connections);
        });
        console.log('initWSServer');
    }
    createGame() {
        try {
            this.game = new voxel_engine_stackgl_1.Game({
                exposeGlobal: false,
                //chunkPad:2,
                pluginLoaders: {
                    'voxel-land': require('voxel-land'),
                    //'voxel-flatland': require('voxel-flatland'),
                    'voxel-bedrock': require('voxel-bedrock'),
                },
                pluginOpts: {
                    'voxel-engine-stackgl': {
                        appendDocument: false,
                        exposeGlobal: false,
                        lightsDisabled: true,
                        arrayTypeSize: 2,
                        useAtlas: true,
                        generateChunks: true,
                        chunkDistance: 2,
                        worldOrigin: [0, 0, 0],
                        controls: {},
                        keybindings: {}
                    },
                    // built-in plugins
                    'voxel-registry': {},
                    'voxel-land': { populateTrees: true },
                    /*'voxel-flatland': {
                        block: 'bedrock', onDemand: false
                    },*/
                    'voxel-mesher': {},
                    'voxel-bedrock': {},
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    // Setup the client connection - register events, etc
    connectClient(connection, id) {
        var self = this;
        // create 'connection' remote event emitter from duplex stream
        //var connection = DuplexEmitter(duplexStream);
        // register client id
        id = id || uuid();
        connection.id = id;
        self.broadcast(id, 'join', id);
        var client = self.clients[id] = {
            id: id,
            connection: connection,
            player: {
                rotation: vec3.create(),
                position: vec3.create(),
            },
        };
        // setup client response handlers
        self.bindClientEvents(client);
        // send client id and initial game settings
        console.log('connection.emit(id)');
        connection.emit('id', id);
        connection.emit('settings', {});
    }
    removeClient(id) {
        var self = this;
        var client = self.clients[id];
        delete self.clients[id];
        self.broadcast(id, 'leave', id);
    }
    bindClientEvents(client) {
        var self = this;
        var game = self.game;
        var id = client.id;
        var connection = client.connection;
        console.log('Events binding');
        /*self.game.voxels.on('chunk', function(chunk: any) {
            console.log('missingChunk 2');
            connection.emit('chunk', chunk);
        });*/
        // forward chat message
        connection.on('chat', self.handleErrors(function (message) {
            // ignore if no message provided
            if (!message.text) {
                return;
            }
            // limit chat message length
            if (message.text.length > 140) {
                message.text = message.text.substr(0, 140);
            }
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
            client.player.rotation[0] = state.rotation[0];
            client.player.rotation[1] = state.rotation[1]; // copy x,y rotation TODO: why not z?
            var pos = client.player.position;
            var distance = vec3.distance(pos, state.position);
            if (distance > 20) {
                var before = pos.clone();
                vec3.lerp(state.position, pos, state.position, 0.1);
                return;
            }
            vec3.copy(pos, state.position);
            self.emit('client.state', client, state);
        }));
        // client modifies a block
        var chunkCache = self.chunkCache;
        connection.on('set', self.handleErrors(function (pos, val) {
            game.setBlock(pos, val);
            var chunkID = self.getChunkId(pos);
            if (chunkCache[chunkID]) {
                delete chunkCache[chunkID];
            }
            // broadcast 'set' to all players
            self.broadcast(null, 'set', pos, val, client.id);
        }));
        connection.on('missingChunk', self.handleErrors(function (pos) {
            var chunk = self.game.getChunkAtPosition(pos);
            console.log('missingChunk', pos, (chunk ? 'chunk' : 'nochunk'));
            if (!chunk) {
                //var plugin = self.game.plugins.get('voxel-flatland');
                //console.log('plugin', plugin, self.game.plugins);
                //chunk = plugin.missingChunk(pos);
                chunk = self.game.voxels.generateChunk(pos[0] | 0, pos[1] | 0, pos[2] | 0);
                //console.log(chunk);//process.exit(1);
                //self.game.voxels.requestMissingChunks(pos);
            }
            self.emitChunk(connection, chunk);
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
    broadcast(id, ...event) {
        return;
        var self = this;
        // normalize arguments
        var args = [].slice.apply(arguments);
        // remove client `id` argument
        args.shift();
        // emit on self for module consumers, unless specified not to
        if (id !== 'server') {
            self.emit.apply(self, args);
        }
        Object.keys(self.clients).map(function (clientId) {
            if (clientId === id) {
                return;
            }
            // emit over connection
            try {
                var connection = self.clients[clientId].connection;
                console.log('self.clients[clientId]', clientId);
                connection.emit.apply(connection, args);
            }
            catch (err) {
                console.log('removing erroring client', clientId, err);
                self.removeClient(clientId);
            }
        });
    }
    // broadcast position, rotation updates for each player
    sendUpdate() {
        var self = this;
        var clientIds = Object.keys(self.clients);
        if (clientIds.length === 0) {
            return;
        }
        var update = {
            positions: {},
            date: +new Date()
        };
        console.log('clientIds', clientIds);
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
        console.log('sendInitialChunks', connection.id);
        Object.keys(chunks).map(function (chunkID) {
            var chunk = chunks[chunkID];
            self.emitChunk(connection, chunk);
        });
        connection.emit('noMoreChunks', true);
    }
    getCachedChunk(chunk) {
        var self = this;
        var chunkID = self.getChunkId(chunk.position);
        var encoded = self.chunkCache[chunkID];
        if (!encoded) {
            encoded = crunch.encode(chunk.data);
            self.chunkCache[chunkID] = encoded;
        }
        return encoded;
    }
    getChunkId(pos) {
        return this.game.voxels.chunkAtPosition(pos).join('|');
    }
    emitChunk(connection, chunk) {
        let encoded = this.getCachedChunk(chunk);
        console.log({
            position: chunk.position,
            dims: chunk.shape,
            length: chunk.data.length
        });
        connection.emit('chunk', encoded, {
            position: chunk.position,
            dims: chunk.shape,
            length: chunk.data.length
        });
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
exports.GameServer = GameServer;
