import { Vue, Component,Provide } from 'vue-property-decorator';
import {SecurityService} from '../../services/Security';

@Component({
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
export default class ProfileQuickInfo extends Vue {
	@Provide()
	username:string='';

	@Provide()
	pic:string='http://lorempixel.com/40/40/nightlife/'

	mounted () {
		var self = this;
		self.$root.$on('authentication:login', function(msg:any){
			self.username = msg.identity.name;
		});
		self.$root.$on('authentication:logout' , function(msg:any){
			self.username = null;
		});
	}

	destroyed () {
	}

}
