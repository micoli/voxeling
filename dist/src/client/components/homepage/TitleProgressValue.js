"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let TitleProgressValue = 
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
class TitleProgressValue extends vue_property_decorator_1.Vue {
    mounted() {
        setTimeout(function () {
            //$('.progress .progress-bar',this.$el).progressbar();
        }, 200);
    }
    destroyed() {
    }
};
TitleProgressValue = __decorate([
    vue_property_decorator_1.Component({
        props: {
            width: { default: '100' },
            title: { default: 'Title' },
            value: { default: '0' },
            tvalue: { default: '0.0' }
        },
        template: `
	<div class="widget_summary">
		<div class="w_left w_25">
			<span>{{ title }}</span>
		</div>
		<div class="w_center w_55">
			<div class="progress">
				<div class="progress-bar bg-green" role="progressbar" v-bind:aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" style="{width: width + '%'}">
					<span class="sr-only">{{ value }} % Complete</span>
				</div>
			</div>
		</div>
		<div class="w_right w_20">
			<span>{{ tvalue }}</span>
		</div>
		<div class="clearfix"></div>
	</div>`
    })
    //v-bind:class="'fa'  _icon"
    //['progress-bar' 'color']
], TitleProgressValue);
exports.default = TitleProgressValue;
