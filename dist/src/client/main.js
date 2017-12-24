"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
test: /\.(glsl|frag|vert|vsh|fsh)$/,
loader: 'raw'
},{
test: /\.(glsl|frag|vert|vsh|fsh)$/,
loader: 'glslify'

*/
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
require("./vendor");
require("./services/EventHub");
const vue_1 = require("vue");
const vue_router_1 = require("vue-router");
const Security_1 = require("./services/Security");
const ClosableWidget_1 = require("./components/common/ClosableWidget");
const ProfileQuickInfo_1 = require("./components/menu/ProfileQuickInfo");
const ProfileMenu_1 = require("./components/menu/ProfileMenu");
const SideMenu_1 = require("./components/menu/SideMenu");
const TopMenuToggle_1 = require("./components/menu/TopMenuToggle");
const TitleProgressBar_1 = require("./components/homepage/TitleProgressBar");
const TitleProgressValue_1 = require("./components/homepage/TitleProgressValue");
const TitleStatCount_1 = require("./components/homepage/TitleStatCount");
//import TitleStatCount from './components/homepage/TitleStatCount';
const Homepage_1 = require("./components/homepage/Homepage");
const Homepage2_1 = require("./components/homepage/Homepage2");
const Auth_1 = require("./components/auth/Auth");
vue_1.default.mixin({
    data: function () {
        return {
            security: Security_1.SecurityService
        };
    }
});
vue_1.default.config.productionTip = false;
vue_1.default.use(vue_router_1.default);
var router = new vue_router_1.default({
    routes: [{
            path: '/',
            component: Homepage_1.default
        }, {
            path: '/auth',
            name: 'auth',
            components: {
                standalone: Auth_1.default
            }
        }, {
            path: '/dashboard-2',
            component: Homepage2_1.default,
            meta: {
                rights: ['*']
            },
            beforeEnter: function (to, from, next) {
                //Vue.nextTick(function () {});
                Security_1.SecurityService.authorize(to.meta.rights, to, next);
            }
        }]
});
/*router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.rights)) {
        SecurityService.authorize(to.meta.rights,to,next);
    }else{
        next();
    }
});*/
var vm = new vue_1.default({
    el: '#app',
    components: {
        //App,
        ProfileQuickInfo: ProfileQuickInfo_1.default,
        ProfileMenu: ProfileMenu_1.default,
        SideMenu: SideMenu_1.default,
        TopMenuToggle: TopMenuToggle_1.default,
        ClosableWidget: ClosableWidget_1.default,
        Homepage: Homepage_1.default,
        TitleStatCount: TitleStatCount_1.default,
        TitleProgressBar: TitleProgressBar_1.default,
        TitleProgressValue: TitleProgressValue_1.default
    },
    created: function () {
        Security_1.SecurityService.init(this);
    },
    router: router
});
