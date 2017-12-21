"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return {
        register: (server, options) => {
            const database = options.database;
            const serverConfig = options.serverConfigs;
            const validateUser = (decoded, request, cb) => {
                database.userModel.findById(decoded.id).lean(true)
                    .then((user) => {
                    if (!user) {
                        return cb(null, false);
                    }
                    return cb(null, true);
                });
            };
            return new Promise((resolve) => {
                server.register({
                    register: require('bell')
                }, (error) => {
                    if (error) {
                        console.log(`Error registering bell plugin: ${error}`);
                    }
                    else {
                        server.auth.strategy('twitter', 'bell', {
                            provider: 'twitter',
                            password: 'cookie_encryption_password_secure',
                            isSecure: false,
                            clientId: serverConfig.social.twitter.id,
                            clientSecret: serverConfig.social.twitter.secret
                        });
                    }
                    resolve();
                });
            });
        },
        info: () => {
            return {
                name: "bell Authentication",
                version: "1.0.0"
            };
        }
    };
};
