"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let TitleProgressBar = 
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
class TitleProgressBar extends vue_property_decorator_1.Vue {
    mounted() {
        let self = this;
        setTimeout(function () {
            //$('.progress .progress-bar',self.$el).progressbar();
        }, 200);
    }
};
TitleProgressBar = __decorate([
    vue_property_decorator_1.Component({
        props: {
            width: { type: String, default: '76' },
            title: { type: String, default: 'Title' },
            value: { type: Number, default: 0 },
            color: { type: String, default: 'bg-green' }
        },
        template: `
	<div>
		<p>{{ title }}</p>
		<div class="">
			<div class="progress progress_sm" style="{width: width + '%'}">
				<div v-bind:class="" role="progressbar" v-bind:data-transitiongoal="value"></div>
			</div>
		</div>
	</div>`
    })
    //v-bind:class="'fa'  _icon"
    //['progress-bar' 'color']
], TitleProgressBar);
exports.default = TitleProgressBar;
