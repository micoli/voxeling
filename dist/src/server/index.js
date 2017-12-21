"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./server");
const Database = require("./database");
const Configs = require("./configurations");
console.log(`Running enviroment ${process.env.NODE_ENV || "dev"}`);
process.on('uncaughtException', (error) => {
    console.error(`uncaughtException ${error.message}`);
});
process.on('unhandledRejection', (reason) => {
    console.error(`unhandledRejection ${reason}`);
});
const dbConfigs = Configs.getDatabaseConfig();
const database = Database.init(dbConfigs);
const serverConfigs = Configs.getServerConfigs();
Server.init(serverConfigs, database).then((server) => {
    server.start(() => {
        console.log('Server running at:', server.info.uri);
    });
});
