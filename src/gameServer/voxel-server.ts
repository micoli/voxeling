import { EventEmitter } from 'events';
var DuplexEmitter = require( 'duplex-emitter' );
var extend = require( 'extend' );
var path = require( 'path' );
var uuid = require( 'hat' );
// voxel dependencies
var voxel = require( 'voxel' );
var crunch = require( 'voxel-crunch' );
//import {Engine} from '../gameClient/voxel-engine-stackgl' ;
var engine = require('voxel-engine');
var ndarray = require( 'ndarray' );

export class VoxelServer extends EventEmitter {
	updateDelay: number = 1000 / 3; // every 330ms;
	nbUpdate: number = 0;
	settings: any = {};
	game: any = {};
	chunkCache: any = {};
	forwardEvents: any[] = [];
	clients: any = {};

	constructor( opts: any ) {
		super();
		this.initialize( opts )
	}

	initialize( opts: any ) {
		var self = this
		// server game settings are sent to all
		// new clients when they connect
		var emptyArray: any[];
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
			forwardEvents: emptyArray
		}

		// prepare a server object to return
		var settings = self.settings = extend( {}, defaults, opts )
		self.forwardEvents = settings.forwardEvents
		self.game = engine( settings )

		// forward some events to module consumer
		self.game.voxels.on( 'missingChunk', function( chunk: any ) {
			self.emit( 'missingChunk', chunk );
		} );

		//send all new created chunk to all clients
		// todo send only chunks to interested clients
		self.game.on('renderChunk', function(chunk: any) {
			self.emit( 'renderChunk', chunk );
		});

		var clients = self.clients = {}
		var chunkCache = self.chunkCache = {}

		setInterval( self.handleErrors( function() {
			self.sendUpdate()
		} ), this.updateDelay );
	}

	// Setup the client connection - register events, etc
	connectClient( connection: any ) {
		var self = this
		var settings = self.settings

		// register client id
		var id = uuid()
		connection.id = connection.id = id
		self.broadcast( id, 'join', id )

		setTimeout( function() {
			self.clients[id] = {
				id: id,
				connection: connection,
				player: {
					p: { x: 0, y: 0, z: 0 },
					r: { x: 0, y: 0 }
				}
			};
			// send client id and initial game settings
			connection.emit( 'id', id );
			connection.emit( 'settings', settings );
			console.log( 'id and settings emmited' );
			// setup client response handlers
			self.bindClientEvents( self.clients[id] );
		}, 2000 );
	}

	removeClient( duplexStream: any ) {
		var self = this
		var id = duplexStream.id
		var client = self.clients[id]
		delete self.clients[id]
		self.broadcast( id, 'leave', id )
	}

	bindClientEvents( client: any ) {
		var self = this
		var id = client.id

		// forward chat message
		client.connection.on( 'data', function( message: any ) {
			console.log( 'Data received', message );
		} );
		client.connection.on( 'chat', self.handleErrors( function( message: any ) {
			console.log( 'chat received' );
			// ignore if no message provided
			if ( !message.text ) return
			// limit chat message length
			if ( message.text.length > 140 ) message.text = message.text.substr( 0, 140 )
			self.broadcast( null, 'chat', message )
		} ) );

		// when user ready ( game created, etc )
		client.connection.on( 'created', self.handleErrors( function() {
			// send initial world payload
			self.sendInitialChunks( client )
			// emit client.created for module consumers
			self.emit( 'client.created', client )
		} ) );

		// client sends new position, rotation
		client.connection.on( 'state', self.handleErrors( function( state: any ) {
			client.player.r.x = state.r.x;
			client.player.r.y = state.r.y;

			client.player.p.x = state.p.x;
			client.player.p.y = state.p.y;
			client.player.p.z = state.p.z;

			self.emit( 'client.state', client, state )
			//var pos = client.player.p
			//var distance = pos.distanceTo(state.p)
			//if (distance > 20) {
			//var before = pos.clone()
			//pos.lerp(state.p, 0.1)
			//return
			//}
			//pos.copy(state.p)
		} ) );

		// client modifies a block
		client.connection.on( 'set', self.handleErrors( function( pos: any, val: any ) {
			self.setBlock(client,pos,val);
		} ) );

		// forward custom events
		self.forwardEvents.map( function( eventName ) {
			client.connection.on( eventName, function() {
				var args = [].slice.apply( arguments )
				// add event name
				args.unshift( eventName )
				// add client id
				args.unshift( id )
				self.broadcast.apply( self, args )
			} )
		} )

	}

	// send message to all clients
	broadcast( id: any, ...args: any[] ) {
		var self = this
		// normalize arguments
		//var args = [].slice.apply(arguments)
		// remove client `id` argument
		//args.shift()
		// emit on self for module consumers, unless specified not to
		if ( id !== 'server' ) self.emit.apply( self, args )
		Object.keys( self.clients ).map( function( clientId ) {
			if ( clientId === id ) return
			var connection = self.clients[clientId].connection;
			// emit over connection
			connection.emit.apply( connection, args );
		} )
	}

	// broadcast position, rotation updates for each player
	sendUpdate() {
		var self = this
		var clientIds = Object.keys( self.clients );
		if ( clientIds.length === 0 ) return;
		var update: any = {
			positions: {},
			date: +new Date()
		};
		clientIds.map( function( id ) {
			var client = self.clients[id];
			update.positions[id] = {
				p: client.player.p,
				r: {
					x: client.player.r.x,
					y: client.player.r.y,
				}
			};
		} )
		this.nbUpdate = ( this.nbUpdate + 1 ) % 10;
		if ( this.nbUpdate == 0 ) {
			console.log( this.nbUpdate, JSON.stringify( update ) );
		}
		self.broadcast( null, 'update', update )
	}

	// utility function
	// returns the provided function wrapped in a try-catch
	// emits errors to module consumer
	handleErrors( func: any ) {
		var self = this
		return function() {
			try {
				return func.apply( this, arguments )
			} catch ( error ) {
				self.emit( 'error', error )
			}
		}
	}

	// send all the game chunks
	sendInitialChunks( client: any ) {
		var self = this

		Object.keys( self.game.voxels.chunks ).map( function( chunkID ) {
			self.sendChunk(client,chunkID)
		} )
		client.connection.emit( 'noMoreChunks', true )
	}

	sendChunkold(client:any,chunkID:string){
		var self = this
		var chunk = self.game.voxels.chunks[chunkID];

		chunk.dims = [34, 34, 34];
		var encoded = self.chunkCache[chunkID]
		if ( !encoded ) {
			encoded = crunch.encode( chunk.voxels.data );
			self.chunkCache[chunkID] = encoded;
		}
		client.connection.emit( 'chunk', encoded, {
			position: chunk.position,
			dims: chunk.dims,
			voxels: {
				length: chunk.voxels.data.length,
				shape: chunk.voxels.shape,
				stride: chunk.voxels.stride,
				offset: chunk.voxels.offset
			}
		} );
	}

	sendChunk(client:any,chunkID:string){
		var self = this
		var chunk = self.game.voxels.chunks[chunkID];

		chunk.dims = [32, 32, 32];
		var encoded = self.chunkCache[chunkID]
		var chunkFmt = self.convertChunkVoxels(chunk.voxels,32);
		//k={};chunk.voxels.map(function(v){if (k.hasOwnProperty(v)){k[v]++}else{k[v]=0}});console.log(k);
		if ( !encoded ) {
			encoded = crunch.encode( chunkFmt.data );//chunk.voxels.data
			self.chunkCache[chunkID] = encoded;
		}
		client.connection.emit( 'chunk', encoded, {
			position: chunk.position,
			dims: chunk.dims,
			voxels: {
				length: chunkFmt.data.length,//chunk.voxels.data.length,
				shape: chunkFmt.shape,
				stride: chunkFmt.stride,
				offset: chunkFmt.offset
			}
		} );
	}

	setBlock(client:any,pos:string,val:any){
		var self = this
		self.game.setBlock( pos, val )
		var chunkPos = self.game.voxels.chunkAtPosition( pos )
		var chunkID = chunkPos.join( '|' )
		if ( self.chunkCache[chunkID] ) delete self.chunkCache[chunkID]
		// broadcast 'set' to all players
		self.broadcast( null, 'set', pos, val, client.id )

	}

	convertChunkVoxels(chunk:any, chunksize:number) {
		var chunkSize = 32;
		var width = chunkSize;
		var pad = 4;
		var arrayType = Uint8Array;
		var chunkSizem = width - 1;
		var index=0;
		var buffer = new ArrayBuffer((width + pad) * (width + pad) * (width + pad) * arrayType.BYTES_PER_ELEMENT);
		var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
		var h = pad >> 1;
		var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);
		var b = 0;
		for (var z = 0; z < width; ++z) {
			for (var y = 0; y < width; ++y) {
				for (var x = 0; x < width; ++x) {
					voxels.set(x, y, z, chunk[index++]);
				}
			}
		}
		return voxelsPadded;
	}

}
