import Vue from 'vue';
import {VueConstructor} from 'vue/types/vue';
import {PluginObject,PluginFunction} from 'vue/types/plugin';
import axios from 'axios';
import { LocalStorage }  from './LocalStorage';
import { Constants } from './Security/Constants';
var jwt = require('jsonwebtoken');

//import VueLocalStorage from 'vue-localstorage'
//Vue.use(VueLocalStorage);

//plugin

export class SecurityService  {
	private static _rightNotConnected: any;
	private static _currentIdentity: any;
	private static _authenticated: boolean ;
	private static vue: any;
	private static jwtPrivateKey: string;
	private static returnToRoute: any;
	private static returnToRouteName: any='';

	static userToken: string= '';

	static init(vue:any){
		let self = SecurityService;
		self.vue = vue;
		axios.defaults.baseURL = 'http://localhost:5000/api';
		axios.defaults.headers.common['Authorization'] = 'Bearer ';
		self.jwtPrivateKey='ghjfgdsjh fydusifgkbez;gdsbv,vfdshjfgdsgfzefèç!èygrék';
		self.initInterceptor()
	}
	static isIdentityResolved (){
		let self = SecurityService;
		return !(self._currentIdentity == null);
	}

	static isAuthenticated (){
		let self = SecurityService;
		return self._authenticated;
	}

	static isInAnyRights (rights:any) {
		let self = SecurityService;
		var i,j;
		rights = Array.isArray(rights) ? rights : [ rights ];
		if (arguments.length > 1){
			for (i = 1; i < arguments.length; i++) {
				rights.push(arguments[i]);
			}
		}
		try {
			if (!self._authenticated || !self._currentIdentity.hasOwnProperty("config")) return false;
			if (!self._currentIdentity.config.hasOwnProperty("rights")) return false;
		} catch (e) {
			return false;
		}
		if(self._currentIdentity.config.rights){
			for (j = 0; j < rights.length; j++){
				if (self._currentIdentity.config.rights.indexOf(rights[j])!==-1 || rights[j]=='*'){
					return true;
				}
			}
		}
		return false;
	};

	static removeAuthenticate (){
		let self = SecurityService;
		self._currentIdentity = null;
		self._authenticated = false;
		self.setTokenId(null);
		LocalStorage.removeItem("token");
	};

	static initTokenId (token:any) {
		let self = SecurityService;
		self.userToken = token;
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}

	static setTokenId (token:any) {
		let self = SecurityService;
		self.initTokenId(token);
		LocalStorage.setItem("token", token);
	}

	static getTokenId (){
		return LocalStorage.getItem("token");
	}

	static clearTokenId (){
		return LocalStorage.removeItem("token");
	}

	static checkAndLoadIdentity (){
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
				axios
				.get("users/info")
				.then(function(res:any) {
					self.setIdentity(token)
					resolve(self._currentIdentity);
				},function() {
					resolve(null);
				});
			} else {
				resolve(null);
			}
		});
	}

	static getCurrentIdentity (){
		return SecurityService._currentIdentity;
	}

	public static login (credentials:any) {
		var self = SecurityService;
		self._currentIdentity = null;
		self._authenticated = false;
		return axios.post("users/login",{
			email : credentials.username,
			password : credentials.password,
		}).then(function(res:any) {
			return new Promise((resolve, reject) => {
				try {
					if (res.data.success) {
						self.setIdentity(res.data.token);
						resolve(res.data.token)
					} else {
						reject(res.data.message);
					}
				} catch (e) {
					reject(res.data.message);
				}
			})
		}, function(res:any) {
			return new Promise((resolve, reject) => {
				reject(res.data.message);
			});
		});
	}

	static logout (){
		var self = SecurityService;
		self._currentIdentity = null;
		self.vue.$root.$emit('authentication:logout', {identity: self._currentIdentity});
		self._authenticated = false;
		self.clearTokenId();
	}

	static setIdentity (token:any) {
		var self = SecurityService;
		self._currentIdentity = jwt.decode(token,self.jwtPrivateKey);
		self.vue.$root.$emit('authentication:login', {identity:self._currentIdentity,token:token});
		self._authenticated = true;
		self.setTokenId(token);
	}

	static initInterceptor(){
		var self = SecurityService;

		axios.interceptors.request.use(function (config:any) {
			return config;
		}, function (error:any) {
			return Promise.reject(error);
		});

		axios.interceptors.response.use(function (response:any) {
			return response;
		}, function (response:any) {
			if (response.data){
				if (response.data.hasOwnProperty("class") && /AccessDeniedException$/.test(response.data.class)) {
					self.vue.$root.$emit("secureArea:ressourceDenied", {
						message : response.data.message
					});
					return Promise.reject(response);
				}
			}
			if (response.config && !/\/auth\/validate$/.test(response.config.url)) {
				var events:any ={
					401 : Constants.notAuthenticated,
					403 : Constants.notAuthorized,
					419 : Constants.sessionTimeout,
					440 : Constants.sessionTimeout
				};
				var event: any = events[response.status];
				if (event) {
					self.vue.$root.$emit(event, response);
				}
			}
			return Promise.reject(response);
		});
	}

	public static authorize (rights: string[],to : any, next: any ) {
		var self = SecurityService;

		return self
		.checkAndLoadIdentity()
		.then(function() {
			self.returnToRouteName = '';
			self.returnToRoute = null;
			if (!self.isAuthenticated()) {
				//not yet authenticated
				self.returnToRouteName = to.name|| to.fullPath;
				self.returnToRoute = function(){
					next(to);
				}
				self.vue.$router.replace('/auth');
			} else if (self.isAuthenticated() && rights && rights.length > 0 && !self.isInAnyRights(rights)) {
				//authenticated and not allowed
				self.vue.$router.replace('/accessdenied')
			}else{
				//authenticated and allowed
				next();
			}
		});
	}

	public static finishAuth(){
		let self = SecurityService;
		if (self.returnToRouteName ==="auth" || self.returnToRouteName == "") {
			self.vue.$router.replace("/");
		} else {
			self.returnToRoute()
		}
	}
}
