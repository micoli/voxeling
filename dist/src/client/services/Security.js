"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const LocalStorage_1 = require("./LocalStorage");
const Constants_1 = require("./Security/Constants");
var jwt = require('jsonwebtoken');
//import VueLocalStorage from 'vue-localstorage'
//Vue.use(VueLocalStorage);
//plugin
class SecurityService {
    static init(vue) {
        let self = SecurityService;
        self.vue = vue;
        axios_1.default.defaults.baseURL = 'http://localhost:5000/api';
        axios_1.default.defaults.headers.common['Authorization'] = 'Bearer ';
        self.jwtPrivateKey = 'ghjfgdsjh fydusifgkbez;gdsbv,vfdshjfgdsgfzefèç!èygrék';
        self.initInterceptor();
    }
    static isIdentityResolved() {
        let self = SecurityService;
        return !(self._currentIdentity == null);
    }
    static isAuthenticated() {
        let self = SecurityService;
        return self._authenticated;
    }
    static isInAnyRights(rights) {
        let self = SecurityService;
        var i, j;
        rights = Array.isArray(rights) ? rights : [rights];
        if (arguments.length > 1) {
            for (i = 1; i < arguments.length; i++) {
                rights.push(arguments[i]);
            }
        }
        try {
            if (!self._authenticated || !self._currentIdentity.hasOwnProperty("config"))
                return false;
            if (!self._currentIdentity.config.hasOwnProperty("rights"))
                return false;
        }
        catch (e) {
            return false;
        }
        if (self._currentIdentity.config.rights) {
            for (j = 0; j < rights.length; j++) {
                if (self._currentIdentity.config.rights.indexOf(rights[j]) !== -1 || rights[j] == '*') {
                    return true;
                }
            }
        }
        return false;
    }
    ;
    static removeAuthenticate() {
        let self = SecurityService;
        self._currentIdentity = null;
        self._authenticated = false;
        self.setTokenId(null);
        LocalStorage_1.LocalStorage.removeItem("token");
    }
    ;
    static initTokenId(token) {
        let self = SecurityService;
        self.userToken = token;
        axios_1.default.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
    static setTokenId(token) {
        let self = SecurityService;
        self.initTokenId(token);
        LocalStorage_1.LocalStorage.setItem("token", token);
    }
    static getTokenId() {
        return LocalStorage_1.LocalStorage.getItem("token");
    }
    static clearTokenId() {
        return LocalStorage_1.LocalStorage.removeItem("token");
    }
    static checkAndLoadIdentity() {
        var self = SecurityService;
        return new Promise((resolve, reject) => {
            if (!(self._currentIdentity == null)) {
                resolve(self._currentIdentity);
                return;
            }
            self._currentIdentity = null;
            self._authenticated = false;
            var token = self.getTokenId();
            if (token) {
                self.initTokenId(token);
                axios_1.default
                    .get("users/info")
                    .then(function (res) {
                    self.setIdentity(token);
                    resolve(self._currentIdentity);
                }, function () {
                    resolve(null);
                });
            }
            else {
                resolve(null);
            }
        });
    }
    static getCurrentIdentity() {
        return SecurityService._currentIdentity;
    }
    static login(credentials) {
        var self = SecurityService;
        self._currentIdentity = null;
        self._authenticated = false;
        return axios_1.default.post("users/login", {
            email: credentials.username,
            password: credentials.password,
        }).then(function (res) {
            return new Promise((resolve, reject) => {
                try {
                    if (res.data.success) {
                        self.setIdentity(res.data.token);
                        resolve(res.data.token);
                    }
                    else {
                        reject(res.data.message);
                    }
                }
                catch (e) {
                    reject(res.data.message);
                }
            });
        }, function (res) {
            return new Promise((resolve, reject) => {
                reject(res.data.message);
            });
        });
    }
    static logout() {
        var self = SecurityService;
        self._currentIdentity = null;
        self.vue.$root.$emit('authentication:logout', { identity: self._currentIdentity });
        self._authenticated = false;
        self.clearTokenId();
    }
    static setIdentity(token) {
        var self = SecurityService;
        self._currentIdentity = jwt.decode(token, self.jwtPrivateKey);
        self.vue.$root.$emit('authentication:login', { identity: self._currentIdentity, token: token });
        self._authenticated = true;
        self.setTokenId(token);
    }
    static initInterceptor() {
        var self = SecurityService;
        axios_1.default.interceptors.request.use(function (config) {
            return config;
        }, function (error) {
            return Promise.reject(error);
        });
        axios_1.default.interceptors.response.use(function (response) {
            return response;
        }, function (response) {
            if (response.data) {
                if (response.data.hasOwnProperty("class") && /AccessDeniedException$/.test(response.data.class)) {
                    self.vue.$root.$emit("secureArea:ressourceDenied", {
                        message: response.data.message
                    });
                    return Promise.reject(response);
                }
            }
            if (response.config && !/\/auth\/validate$/.test(response.config.url)) {
                var events = {
                    401: Constants_1.Constants.notAuthenticated,
                    403: Constants_1.Constants.notAuthorized,
                    419: Constants_1.Constants.sessionTimeout,
                    440: Constants_1.Constants.sessionTimeout
                };
                var event = events[response.status];
                if (event) {
                    self.vue.$root.$emit(event, response);
                }
            }
            return Promise.reject(response);
        });
    }
    static authorize(rights, to, next) {
        var self = SecurityService;
        return self
            .checkAndLoadIdentity()
            .then(function () {
            self.returnToRouteName = '';
            self.returnToRoute = null;
            if (!self.isAuthenticated()) {
                //not yet authenticated
                self.returnToRouteName = to.name || to.fullPath;
                self.returnToRoute = function () {
                    next(to);
                };
                self.vue.$router.replace('/auth');
            }
            else if (self.isAuthenticated() && rights && rights.length > 0 && !self.isInAnyRights(rights)) {
                //authenticated and not allowed
                self.vue.$router.replace('/accessdenied');
            }
            else {
                //authenticated and allowed
                next();
            }
        });
    }
    static finishAuth() {
        let self = SecurityService;
        if (self.returnToRouteName === "auth" || self.returnToRouteName == "") {
            self.vue.$router.replace("/");
        }
        else {
            self.returnToRoute();
        }
    }
}
SecurityService.returnToRouteName = '';
SecurityService.userToken = '';
exports.SecurityService = SecurityService;
