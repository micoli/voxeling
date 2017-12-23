"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let ProfileMessagesMenu = class ProfileMessagesMenu extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.username = '';
        this.nbMessages = 0;
        this.messages = [{
                from: "John Doe",
                fromPic: "http://pipsum.com/20x20.jpg",
                time: "",
                message: ""
            }];
    }
    seeAll() {
    }
    mounted() {
        var self = this;
        this._messages = this.messages;
        this._nbMessages = this.nbMessages;
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
};
__decorate([
    vue_property_decorator_1.Prop()
], ProfileMessagesMenu.prototype, "nbMessages", void 0);
__decorate([
    vue_property_decorator_1.Prop()
], ProfileMessagesMenu.prototype, "messages", void 0);
ProfileMessagesMenu = __decorate([
    vue_property_decorator_1.Component({
        template: `
	<li role="presentation" class="dropdown" v-if="username">
		<a href="javascript:;" class="dropdown-toggle info-number" data-toggle="dropdown" aria-expanded="false">
			<i class="fa fa-envelope-o"></i>
			<span class="badge bg-green">{{ _nbMessages }}</span>
		</a>
		<ul id="menu1" class="dropdown-menu list-unstyled msg_list" role="menu">
			<li v-for="message in _messages">
				<a>
					<span class="image"><img :src="message.fromPic" alt="Profile Image" /></span>
					<span>
						<span>{{ message.from }}</span>
						<span class="time">{{ message.time }}</span>
					</span>
					<span class="message">
						{{ message.message }}
					</span>
				</a>
			</li>
			<li>
				<div class="text-center">
					<a>
						<strong><a href="#" @click.prevent="seeAll">See All Alerts</a></strong>
						<i class="fa fa-angle-right"></i>
					</a>
				</div>
			</li>
		</ul>
	</li>`
    })
], ProfileMessagesMenu);
exports.default = ProfileMessagesMenu;
