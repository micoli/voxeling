"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
const LocalStorage_1 = require("../../services/LocalStorage");
let Auth = class Auth extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.credentials = {
            username: 'toto@titi.com',
            password: 'toto'
        };
        this.rememberCredentials = true;
        this.error = '';
        this.mode = 'login';
    }
    displayRegister() {
        this.mode = 'register';
    }
    displayLogin() {
        this.mode = 'login';
    }
    displayLostPassword() {
        this.mode = 'lostPassword';
    }
    lostPassword() {
    }
    login() {
        let self = this;
        let credentials = {
            username: this.credentials.username.toLowerCase(),
            password: this.credentials.password
        };
        let securityService = this.security;
        securityService
            .login(credentials)
            .then(function (data) {
            if (self.rememberCredentials && credentials.username && credentials.password) {
                LocalStorage_1.LocalStorage.setItem("credentials", JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                }));
            }
            else {
                LocalStorage_1.LocalStorage.removeItem("credentials");
            }
            securityService.finishAuth();
        }, function (e) {
            console.log('error', e);
        }).catch(function (data) {
            console.log('error', data);
        });
    }
    register() {
        let self = this;
        let credentials = {
            username: this.credentials.username.toLowerCase(),
            password: this.credentials.password
        };
        let securityService = this.security;
    }
    destroyed() {
    }
};
Auth = __decorate([
    vue_property_decorator_1.Component({
        template: `
	<div class="login">
		<div class="login_wrapper">
			<div class="animate form" v-show="mode=='login'">
				<section class="login_content">
					<form @submit="login">
						<h1>Login Form</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" v-model="credentials.username" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" v-model="credentials.password" />
						</div>
						<div>
							<button type="submit" class="btn btn-default submit" @click="login">Log in</button>
							<a class="reset_pass" @click="displayLostPassword">Lost your password?</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">New to site?
							<a href="#" @click.prevent="displayRegister" class="to_register"> Create Account </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>
			<div class="animate form " v-show="mode=='register'">
				<section class="login_content">
					<form @submit="register">
						<h1>Create Account</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" />
						</div>
						<div>
							<input type="email" class="form-control" placeholder="Email" required="" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" />
						</div>
						<div>
							<a class="btn btn-default submit" href="index.html">Submit</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">Already a member ?
							<a href="#" @click.prevent="displayLogin" class="to_register"> Log in </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>
			<div class="animate form" v-show="mode=='lostPassword'">
				<section class="login_content">
					<form @submit="login">
						<h1>Lost password Form</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username or email" required="" v-model="credentials.username" />
						</div>
						<div>
							<button type="submit" class="btn btn-default submit" @click="lostPassword">send email</button>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">Already a member ?
							<a href="#" @click.prevent="displayLogin" class="to_register"> Log in </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>

		</div>
		<div class="clearfix"></div>
	</div>`,
        components: {}
    })
], Auth);
exports.default = Auth;
