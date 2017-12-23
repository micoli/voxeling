"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let TitleStatCount = class TitleStatCount extends vue_property_decorator_1.Vue {
    constructor() {
        super(...arguments);
        this._icon = 'fa-' + this.icon;
    }
    mounted() {
    }
    destroyed() {
    }
};
TitleStatCount = __decorate([
    vue_property_decorator_1.Component({
        props: {
            icon: { type: String, default: 'fa-user' },
            title: { type: String, default: 'Title' },
            delta: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
            subText: { type: String, default: 'From last week' }
        },
        template: `
	<div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
		<span class="count_top">
			<i class="fa fa-user" ></i> {{ title}}
		</span>
		<div class="count">{{ count }}</div>
		<span class="count_bottom">
			<i v-bind:class="{red:delta<0, green:delta>0}">
				<i v-bind:class="{fa: (delta<-10||delta>10) ,'fa-sort-desc':delta<-10, 'fa-sort-asc':delta>10}"></i>
				{{delta}}%
			</i> {{subText}}
		</span>
	</div>`
    }) //v-bind:class="'fa'  _icon"
], TitleStatCount);
exports.default = TitleStatCount;
