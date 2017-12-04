var WebSocket = require('ws');
var EventEmitter = require('events').EventEmitter;
var slice = Array.prototype.slice;

var log = require('./log')('lib/web-socket-emitter', false);

/*
TODO

* Outline events on the client and server sides. Can remap node events to something that makes more sense given the context

*/
class WebSocketEmitter {
	emitter: any;
	webSocket: any;
	constructor(webSocket: any, emitter: any) {
		this.webSocket = webSocket;
		this.emitter = emitter;
		var self = this;
		// NOTE: I don't want to expose access to the socket
		var browserify = 'binaryType' in webSocket;

		var onOpen = function() {
			log('onOpen');
			emitter.emit('open');
		};

		var onMessage = function(data: any, flags: any) {
			log('onMessage');
			var decoded;
			// flags.binary will be set if a binary data is received.
			// flags.masked will be set if the data was masked.
			if (!data) {
				log('WebSocketEmitter received empty data');
				return;
			}
			try {
				decoded = JSON.parse(data);
			} catch (err) {
				log('WebSocketEmitter error while decoding JSON');
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
			webSocket.onmessage = function(event:any, flags:any) {
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
			};

		} else {
			webSocket.on('error', onError);
			// Yes, this will only get used for client connections, but setting this for an incoming server connection shouldn't hurt
			webSocket.on('open', onOpen);
			webSocket.on('close', onClose);
			webSocket.on('message', onMessage);
		}
	}

	emit(name: any, callback: any) {
		var self = this;

		log('emit');

		if (!name) {
			throw new Exception('name required');
		}

		if (!this.webSocket) {
			self.emitter.emit('error', 'Cannot emit, connection is not open');
			return;
		}

		// hah, right! http needs newline to terminate data
		var len = arguments.length;
		var args = new Array(len);
		var str:any;
		for (var i = 0; i < len; i++) {
			args[i] = arguments[i];
		}
		str = JSON.stringify(args) + "\n";
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
		this.wse = new WebSocketEmitter(ws, this.emitter);
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
export class Server {
	ws: any;
	emitter: any;
	constructor(opts: any) {
		var self = this;
		var wss = this.ws = new WebSocket.Server(opts || {
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
			var wse = new WebSocketEmitter(ws, emitter);
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

module.exports = {
	client: Client,
	server: Server
};
