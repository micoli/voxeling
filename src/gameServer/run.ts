import {GameServer} from './game-server';
//var t = new GameServer();

var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
//var duplexEmitter = require('duplex-emitter');
var WebSocketEmitter = require('../shared/web-socket-emitter');

var run = function() {
	//hard coded options (temporary)
	var worldId = 'test';

	var serverPort = 5000;


	var server = new GameServer({
		worldId: worldId
	});

	var httpServer = http.createServer(ecstatic(path.join(__dirname, '../../../public')));
	httpServer.listen(serverPort);

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
