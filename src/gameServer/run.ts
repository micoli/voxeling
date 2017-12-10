import {GameServer} from './game-server';
//var t = new GameServer();

var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
//var WebSocketServer = require('ws').Server;
//var WebSocketStream = require('websocket-stream/stream');
//var duplexEmitter = require('duplex-emitter');
var SimpleWebsocketServer = require('simple-websocket/server')
var WebSocketEmitter = require('../shared/web-socket-emitter');
var level = require('level');
var sublevel = require('level-sublevel');
//voxel dependencies
var voxelLevel = require('voxel-level');
//local dependencies
var run = function() {
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
	httpServer.listen(serverPort);
	//var wss = new WebSocketServer({server: httpServer});
	//var wss = new WebSocketServer({ server: server ,port:1005})
	//var websocket = require('websocket-stream')
	//var server = new Server({ port: port }) // see `ws` docs for other options

	/*var ws = new SimpleWebsocketServer({
		server: '127.0.0.1',
		port: 10005
	})
	ws.on('connection', function (stream) {
		server.connectClient(stream);
		stream.once('end', function() {
			server.removeClient(stream);
		});
		stream.once('error', function() {
			server.removeClient(stream);
		});
	});
	*/
	setTimeout(function(){
		console.log('started');
		var wseServer = new WebSocketEmitter.server({
			server: '127.0.0.1',
			port: 10005
		});

		wseServer.on('error', function(error: any) {
			console.log(error);
		});

		wseServer.on('connection', function(connection: any) {
			console.log('connected');
			server.connectClient(connection);
			connection.on('close', function() {
				console.log('main connection closed');
				server.removeClient(connection);
			});
			connection.on('error', function() {
				console.log('main connection error');
				server.removeClient(connection);
			});
		});
	},3000);


};

run();
