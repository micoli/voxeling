var WebSocket = require('ws');
var EventEmitter = require('events').EventEmitter;
var slice = Array.prototype.slice;
var SimpleWebsocketServer = require('simple-websocket/server')

var log = require('./log')('lib/web-socket-emitter', false );

/*
TODO

* Outline events on the client and server sides. Can remap node events to something that makes more sense given the context

*/
class WebSocketEmitter {
	emitter: any;
	webSocket: any;
	isOpen: any;
	constructor(webSocket: any, emitter: any,isOpen:any) {
		this.webSocket = webSocket;
		this.emitter = emitter;
		this.isOpen=isOpen;
		var self = this;
		// NOTE: I don't want to expose access to the socket
		var browserify = 'binaryType' in webSocket;

		var onOpen = function() {
			log('onOpen');
			emitter.emit('open');
		};

		var onMessage = function(data: any, flags: any) {
			var decoded;
			// flags.binary will be set if a binary data is received.
			// flags.masked will be set if the data was masked.
			if (!data) {
				log('WebSocketEmitter received empty data');
				return;
			}
			try {
				decoded = JSON.parse(browserify?data.data:data);
				//console.log('onMessage',decoded);
			} catch (err) {
				console.log('WebSocketEmitter error while decoding JSON',data,err);
				//console.log(data)
				return;
			}
			emitter.emit.apply(emitter, decoded);
		};

		var onError = function(message: any) {
			log('onError');
			emitter.emit('error', message);
		};

		var onClose = function() {
			log('onClose');
			self.webSocket = null;
			emitter.emit('close');
		};

		log(browserify ? 'WSE is browserified' : 'WSE is not browserified');

		if (browserify) {
			// handle browserify WebSocket version
			webSocket.onerror = onError;
			// Yes, this will only get used for client connections, but setting this for an incoming server connection shouldn't hurt
			webSocket.onopen = onOpen;
			webSocket.onclose = onClose;
			webSocket.onmessage = onMessage;/*function(event:any, flags:any) {
				log('onmessage');
				if (event.data instanceof Blob) {
					var reader = new FileReader();
					reader.addEventListener('loadend', function() {
						onMessage.call(null, reader.result, flags);
					});
					reader.readAsText(event.data);
				} else {
					log('Unexpected data type');
				}
			};*/

		} else {
			webSocket.on('error', onError);
			// Yes, this will only get used for client connections, but setting this for an incoming server connection shouldn't hurt
			webSocket.on('open', onOpen);
			webSocket.on('close', onClose);
			webSocket.on('message', onMessage);
			webSocket.on('data', onMessage);
		}
	}

	emit(name: any, callback: any) {
		var self = this;

		log('emit',name);

		if (!name) {
			throw 'Name required (emit)';
		}

		if (!this.isOpen()) {
			self.emitter.emit('error', 'Cannot emit, connection is not open');
			//console.log('error', 'Cannot emit, connection is not open');
			return;
		}

		// hah, right! http needs newline to terminate data
		var len = arguments.length;
		var args = new Array(len);
		var str:any;
		for (var i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		str = JSON.stringify(args);
		this.webSocket.send(
			str,
			{
				binary: true,
				mask: false
			},
			function(error: any) {
				if (error) {
					self.emitter.emit('error', 'Emit error: ' + error);
					return;
				}
				log('WebSocketEmitter sent data: ' + str);
			}
		);
	}

	on(name: any, callback: any) {
		this.emitter.on(name, callback);
	}

	close() {
		this.webSocket.close();
	}
}

export class Client {
	url: any;
	wse: any;
	emitter: any;
	constructor() {
		this.emitter = new EventEmitter();
		this.wse = null;
	}

	// TODO: hoist onError, onMessage helper methods up so server can use them too
	connect(url: any) {
		var self = this;
		// Don't need to specify URL if we did previously
		this.url = url || this.url;
		var ws = new WebSocket(this.url);
		this.wse = new WebSocketEmitter(ws, this.emitter, function(){
			return !!ws && ws.readyState == 1;
		});
		return ws;
	}

	on(name: any, callback: any) {
		this.emitter.on(name, callback);
	}

	emit() {
		var len = arguments.length;
		var args = new Array(len);
		for (var i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		if (this.wse) {
			this.wse.emit.apply(this.wse, args);
		} else {
			log('Premature emit. Not connected yet');
		}
	}

	close() {
		if (this.wse) {
			this.wse.close();
		} else {
			log('Premature close. Not connected yet');
		}
	}
}

// Same opts you'd pass to ws module
export class Server2 {
	ws: any;
	emitter: any;
	constructor(opts: any) {
		var self = this;
		var wss = this.ws = new SimpleWebsocketServer(opts || {
			port: 10005
		});
		var browserify = 'onconnection' in wss;

		this.emitter = new EventEmitter();

		var onError = function(message:any) {
			log('onError');
			self.emitter.emit('error', message);
		};

		var onConnection = function(ws:any) {
			log('onConnection');
			//var location = url.parse(ws.upgradeReq.url, true);
			var emitter = new EventEmitter();
			var wse = new WebSocketEmitter(ws, emitter, function(){
				return !!ws;
			});
			self.emitter.emit('connection', wse);
		};

		log(browserify ? 'WSE Server is browserified' : 'WSE Server is not browserified');

		if (browserify) {
			wss.onconnection = onConnection;
			wss.onerror = onError;
		} else {
			wss.on('connection', onConnection);
			wss.on('error', onError);
		}
	}

	on(name: any, callback: any) {
		this.emitter.on(name, callback);
	}
}

export class Server {
	ws: any;
	emitter: any;
	constructor(opts: any) {
		var self = this;
		var wss = this.ws = new SimpleWebsocketServer(opts || {
			port: 10005
		});
		this.emitter = new EventEmitter();

		self.ws.on('connection', function (socket) {
			var emitter = new EventEmitter();
			var wse = new WebSocketEmitter(socket, emitter, function(){
				return !!socket._ws;
			});
			self.emitter.emit('connection', wse);

			socket.on('error', function(message:any) {
				log('onError');
				emitter.emit('error', message);
			});

			socket.on('close', function() {
				log('onClose');
				self.ws = null;
				emitter.emit('close',self.ws);
			});
		});

		self.ws.on('error',function(){
			this.emitter.emit('error');
		});
	}
	on(name: any, callback: any) {
		console.log('on1',name);
		this.emitter.on(name, callback);
	}
}

module.exports = {
	client: Client,
	server: Server
};
