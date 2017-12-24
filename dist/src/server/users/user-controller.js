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
const Boom = require("boom");
const Jwt = require("jsonwebtoken");
class UserController {
    constructor(configs, database) {
        this.database = database;
        this.configs = configs;
    }
    generateToken(user) {
        return Jwt.sign({
            id: user._id,
            name: user.name,
            config: {
                rights: []
            }
        }, this.configs.jwtSecret, {
            expiresIn: this.configs.jwtExpiration
        });
    }
    loginUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = request.payload.email;
            const password = request.payload.password;
            let user = yield this.database.userModel.findOne({ email: email, source: 'local' });
            if (!user) {
                return reply({
                    success: false,
                    message: "User does not exists."
                });
            }
            if (!user.validatePassword(password)) {
                return reply({
                    success: false,
                    message: "Password is invalid."
                });
            }
            reply({
                success: true,
                token: this.generateToken(user)
            });
        });
    }
    createUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                request.payload.source = 'local';
                request.payload.socialId = 'local';
                let userPresent = yield this.database.userModel.findOne({
                    email: request.payload.email,
                    source: request.payload.source
                });
                if (userPresent) {
                    return reply({
                        success: false,
                        message: 'user already exists'
                    }).code(201);
                }
                let user = yield this.database.userModel.create(request.payload);
                return reply({
                    success: true,
                    token: this.generateToken(user)
                }).code(201);
            }
            catch (error) {
                return reply(Boom.badImplementation(error));
            }
        });
    }
    updateUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = request.auth.credentials.id;
            try {
                let user = yield this.database.userModel.findByIdAndUpdate(id, { $set: request.payload }, { new: true });
                return reply(user);
            }
            catch (error) {
                return reply(Boom.badImplementation(error));
            }
        });
    }
    deleteUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = request.auth.credentials.id;
            let user = yield this.database.userModel.findByIdAndRemove(id);
            return reply(user);
        });
    }
    infoUser(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = request.auth.credentials.id;
            let user = yield this.database.userModel.findById(id);
            reply(user);
        });
    }
    twitterRegister(request, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!request.auth.isAuthenticated) {
                    return reply({
                        success: false,
                        message: 'Authentication failed: ' + request.auth.error.message
                    });
                }
                const profile = request.auth.credentials.profile;
                let userStruct = {
                    source: 'twitter',
                    email: profile.username,
                    socialId: profile.id,
                    name: profile.displayName,
                    password: 'external'
                };
                let user = yield this.database.userModel.findOne({
                    email: userStruct.email,
                    source: 'twitter'
                });
                if (!user) {
                    user = yield this.database.userModel.create(userStruct);
                }
                //console.log('- profile' , profile);
                //console.log('- user' , user);
                //console.log('- token' , this.generateToken(user));
                return reply.redirect('/#/auth/callback/' + this.generateToken(user));
            }
            catch (error) {
                return reply(Boom.badImplementation(error));
            }
        });
    }
}
exports.default = UserController;
