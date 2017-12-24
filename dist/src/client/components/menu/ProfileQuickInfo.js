"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let ProfileQuickInfo = class ProfileQuickInfo extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this.username = '';
        this.pic = 'http://lorempixel.com/40/40/nightlife/';
    }
    mounted() {
        var self = this;
        self.$root.$on('authentication:login', function (msg) {
            self.username = msg.identity.name;
        });
        self.$root.$on('authentication:logout', function (msg) {
            self.username = null;
        });
    }
    destroyed() {
    }
};
__decorate([
    vue_property_decorator_1.Provide()
], ProfileQuickInfo.prototype, "username", void 0);
__decorate([
    vue_property_decorator_1.Provide()
], ProfileQuickInfo.prototype, "pic", void 0);
ProfileQuickInfo = __decorate([
    vue_property_decorator_1.Component({
        template: `
	<div class="profile clearfix" >
		<div class="profile_pic" v-if="username">
			<img v-bind:src="pic" alt="..." class="img-circle profile_img">
		</div>
		<div class="profile_info" v-if="username">
			<span>Welcome,</span>
			<h2>{{username}}</h2>
		</div>
	</div>`
    })
], ProfileQuickInfo);
exports.default = ProfileQuickInfo;
