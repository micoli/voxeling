"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
const ProfileMessagesMenu_1 = require("./ProfileMessagesMenu");
let ProfileMenu = class ProfileMenu extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.username = '';
    }
    mounted() {
        var self = this;
        self.$root.$on('authentication:login', function (msg) {
            self.username = msg.identity.name;
        });
        self.$root.$on('authentication:logout', function (msg) {
            self.username = null;
        });
        vue_property_decorator_1.Vue.nextTick(function () {
            let securityService = self.security;
            securityService.checkAndLoadIdentity();
        });
    }
    login() {
        this.$router.replace('/auth');
    }
    logout() {
        var self = this;
        let securityService = self.security;
        securityService.logout();
        this.$router.replace('/');
    }
    destroyed() {
    }
};
__decorate([
    vue_property_decorator_1.Provide()
], ProfileMenu.prototype, "username", void 0);
ProfileMenu = __decorate([
    vue_property_decorator_1.Component({
        template: `
	<ul class="nav navbar-nav navbar-right">
		<!-- user menu -->
		<li class="">
			<a href="javascript:;" class="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
				<span v-if="username">
					<img src="images/img.jpg" alt="">{{ username }}
				</span>
				<span v-if="!username">
					<a href="#" @click.prevent.self="login">Log In</a>
				</span>
				<span class=" fa fa-angle-down"></span>
			</a>
			<ul class="dropdown-menu dropdown-usermenu pull-right">
				<li v-if="username">
					<a href="javascript:;"> Profile</a>
				</li>
				<li v-if="username">
					<a href="javascript:;">
						<span class="badge bg-red pull-right">50%</span>
						<span>Settings</span>
					</a>
				</li>
				<li v-if="username">
					<a href="#" @click.prevent="logout"><i class="fa fa-sign-out pull-right"></i> Log Out</a>
				</li>
			</ul>
		</li>
		<!-- end of user menu -->
		<!-- last messages -->
		<profile-messages-menu></profile-messages-menu>
		<!-- end of last messages -->
	</ul>`,
        components: {
            ProfileMessagesMenu: ProfileMessagesMenu_1.default
        }
    })
], ProfileMenu);
exports.default = ProfileMenu;
