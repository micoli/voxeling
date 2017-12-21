"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nconf = require("nconf");
const path = require("path");
nconf.env({
    separator: '__',
    match: /^.*__.*/
})
    .argv()
    .file({
    file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
});
function getDatabaseConfig() {
    return nconf.get("database");
}
exports.getDatabaseConfig = getDatabaseConfig;
function getServerConfigs() {
    return nconf.get("server");
}
exports.getServerConfigs = getServerConfigs;
console.log('- - - - - - - -');
console.log('Env : ', process.env.NODE_ENV);
console.log("Full config : ", nconf.get(null));
console.log('- - - - - - - -');
console.log('Database : ', getDatabaseConfig());
console.log('Server : ', getServerConfigs());
console.log('- - - - - - - -');
