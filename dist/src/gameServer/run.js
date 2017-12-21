"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_server_1 = require("./game-server");
const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const web_socket_emitter_1 = require("../shared/web-socket-emitter");
var run = function () {
    var worldId = 'test';
    var serverPort = 5000;
    var gameServer = new game_server_1.GameServer({
        worldId: worldId
    });
    const httpServer = new Hapi.Server();
    httpServer.connection({
        port: serverPort,
        routes: {
            cors: true,
            files: {
                relativeTo: Path.join(__dirname, '../../../public')
            }
        }
    });
    const provision = () => __awaiter(this, void 0, void 0, function* () {
        yield httpServer.register(Inert);
        yield httpServer.start();
        httpServer.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: '.',
                    redirectToSlash: true,
                    index: true,
                }
            }
        });
        console.log('Server running at:', httpServer.info.uri, Path.join(__dirname, '../../../public'));
    });
    provision();
    setTimeout(function () {
        console.log('started');
        var wseServer = new web_socket_emitter_1.Server({
            server: '127.0.0.1',
            port: 10005
        });
        wseServer.on('error', function (error) {
            console.log(error);
        });
        wseServer.on('connection', function (connection) {
            console.log('connected');
            gameServer.connectClient(connection);
            connection.on('close', function () {
                console.log('main connection closed');
                gameServer.removeClient(connection);
            });
            connection.on('error', function () {
                console.log('main connection error');
                gameServer.removeClient(connection);
            });
        });
    }, 3000);
};
run();
