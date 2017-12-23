"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
let ClosableWidget = 
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
class ClosableWidget extends vue_property_decorator_1.Vue {
    data() {
        return {
            heightClasses: ['x_panel', 'tile', this.heightClass]
        };
    }
    collapse(el) {
        var $BOX_PANEL = $(el.target).closest('.x_panel'), $ICON = $(el.target).find('i'), $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function () {
                $BOX_PANEL.removeAttr('style');
            });
        }
        else {
            $BOX_CONTENT.slideToggle(200);
            $BOX_PANEL.css('height', 'auto');
        }
        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    }
    close(el) {
        $(el.target).closest('.x_panel').remove();
    }
};
ClosableWidget = __decorate([
    vue_property_decorator_1.Component({
        props: {
            heightClass: { type: String, default: 'fixed_height_320' },
            size: { type: String, default: 'col-md-4 col-sm-4 col-xs-12' },
            title: { type: String, default: 'Title' },
            closable: { type: Boolean, default: true }
        },
        template: `
	<div v-bind:class="size">
		<div v-bind:class="heightClasses" >
			<div class="x_title">
				<h2>{{ title }}</h2>
				<ul class="nav navbar-right panel_toolbox">
					<li><a @click="collapse" class="collapse-link"><i class="fa fa-chevron-up"></i></a>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-wrench"></i></a>
						<ul class="dropdown-menu" role="menu">
							<li><a href="#">Settings 1</a>
							</li>
							<li><a href="#">Settings 2</a>
							</li>
						</ul>
					</li>
					<li><a @click="close" class="close-link"><i class="fa fa-close"></i></a>
					</li>
				</ul>
				<div class="clearfix"></div>
			</div>
			<div class="x_content">
				<slot></slot>
			</div>
		</div>
	</div>`
    })
    //v-bind:class="'fa'  _icon"
    //['progress-bar' 'color']
], ClosableWidget);
exports.default = ClosableWidget;
