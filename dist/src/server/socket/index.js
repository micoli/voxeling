"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jwt = require("jsonwebtoken");
exports.register = function (server, configs, options) {
    console.log('Serving socket io');
    server.register({
        register: require('hapi-io'),
        options: options
    });
    var io = server.plugins['hapi-io'].io;
    io.of('/chatroom').on('connection', function (socket) {
        socket.user = null;
        console.log('New connection');
        socket.on('login', function (token) {
            socket.user = null;
            if (Jwt.verify(token, configs.jwtSecret)) {
                socket.user = Jwt.decode(token);
            }
            console.log('login', token);
        });
        socket.on('logout', function (token) {
            socket.user = null;
            console.log('logout', token);
        });
        socket.on('join', function (roomId) {
            socket.emit('someEvent', 1233333);
            socket.broadcast.to(4444).emit('someEvent', 123);
        });
        socket.on('disconnect', function () {
            console.log(11);
            socket.broadcast.to(123).emit('someEvent', 123);
        });
    });
};
