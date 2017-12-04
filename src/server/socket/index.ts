import * as Hapi from "hapi";
import * as Jwt from "jsonwebtoken";
import {IServerConfigurations} from "../configurations";

export const register = function(server: Hapi.Server, configs: IServerConfigurations, options: any) {
	console.log('Serving socket io');

	server.register({
		register: require('hapi-io'),
		options: options
	});

	var io = server.plugins['hapi-io'].io;

	io.of('/chatroom').on('connection', function(socket: any) {
		socket.user = null;
		console.log('New connection');

		socket.on('login', function(token: string) {
			socket.user = null;
			if (Jwt.verify(token, configs.jwtSecret)) {
				socket.user = Jwt.decode(token);
			}
			console.log('login', token);
		});

		socket.on('logout', function(token: string) {
			socket.user = null;
			console.log('logout', token);
		});

		socket.on('join', function(roomId: string) {
			socket.emit('someEvent', 1233333);
			socket.broadcast.to(4444).emit('someEvent', 123);
		});

		socket.on('disconnect', function() {
			console.log(11);
			socket.broadcast.to(123).emit('someEvent', 123);
		});
	});
};
