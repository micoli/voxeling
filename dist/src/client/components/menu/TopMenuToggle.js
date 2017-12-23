"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let TopMenuToggle = class TopMenuToggle extends vue_property_decorator_1.Vue {
    toggle() {
        this.$root.$emit('navigation:menuToggle');
    }
};
TopMenuToggle = __decorate([
    vue_property_decorator_1.Component({
        template: `
	<div class="nav toggle">
		<a @click="toggle"><i class="fa fa-bars"></i></a>
	</div>`
    })
], TopMenuToggle);
exports.default = TopMenuToggle;
