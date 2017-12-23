"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_property_decorator_1 = require("vue-property-decorator");
const eventHub = new vue_property_decorator_1.Vue();
vue_property_decorator_1.Vue.mixin({
    data: function () {
        return {
            eventHub: eventHub
        };
    }
});
