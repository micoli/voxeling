import {GameServer} from './game-server';
//var t = new GameServer();

var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var duplexEmitter = require('duplex-emitter');
var level = require('level');
var sublevel = require('level-sublevel');
//voxel dependencies
var voxelLevel = require('voxel-level');
//local dependencies

//hard coded options (temporary)
var worldId = 'test';
var dbPath = path.resolve(__dirname, '../world/', worldId);
var serverPort = 5000;


// setup fancy db
var voxelDb = voxelLevel(sublevel(level(dbPath)));

//create server
var server = new GameServer({
	worldId: worldId,
	voxelDb: voxelDb,
});
//setup WebSocketServer
var httpServer = http.createServer(ecstatic(path.join(__dirname, '../../../public')));
var wss = new WebSocketServer({server: httpServer});
httpServer.listen(serverPort);
wss.on('connection', function(ws:any) {
	var stream = websocket(ws);
	var connection = duplexEmitter(stream);
	server.connectClient(connection);
	//handle connection end/ error
	stream.once('end', function() {
		server.removeClient(connection);
	});
	stream.once('error', function() {
		server.removeClient(connection);
	});
});
