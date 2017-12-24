import { Vue } from 'vue-property-decorator';

const eventHub = new Vue();

Vue.mixin({
	data: function () {
        return {
            eventHub: eventHub
        }
    }
});
