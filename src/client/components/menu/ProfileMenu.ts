import { Vue, Component,Provide } from 'vue-property-decorator';
import { SecurityService } from '../../services/Security';
import ProfileMessagesMenu from './ProfileMessagesMenu';

@Component({
	template: `
	<ul class="nav navbar-nav navbar-right">
		<!-- user menu -->
		<li class="">
			<a href="javascript:;" class="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
				<span v-if="username">
					<img src="images/img.jpg" alt="">{{ username }}
				</span>
				<span v-if="!username">
					<a href="#" @click.prevent.self="login">Log In</a>
				</span>
				<span class=" fa fa-angle-down"></span>
			</a>
			<ul class="dropdown-menu dropdown-usermenu pull-right">
				<li v-if="username">
					<a href="javascript:;"> Profile</a>
				</li>
				<li v-if="username">
					<a href="javascript:;">
						<span class="badge bg-red pull-right">50%</span>
						<span>Settings</span>
					</a>
				</li>
				<li v-if="username">
					<a href="#" @click.prevent="logout"><i class="fa fa-sign-out pull-right"></i> Log Out</a>
				</li>
			</ul>
		</li>
		<!-- end of user menu -->
		<!-- last messages -->
		<profile-messages-menu></profile-messages-menu>
		<!-- end of last messages -->
	</ul>`,
	components:{
		ProfileMessagesMenu:ProfileMessagesMenu
	}
})
export default class ProfileMenu extends Vue {
	@Provide()
	username:string='';

	mounted () {
		var self = this;
		self.$root.$on('authentication:login', function(msg:any){
			self.username = msg.identity.name;
		});
		self.$root.$on('authentication:logout' , function(msg:any){
			self.username = null;
		});
		Vue.nextTick(function(){
			let securityService = (self.security as typeof SecurityService);
			securityService.checkAndLoadIdentity()
		});

	}
	login(){
		this.$router.replace('/auth');
	}
	logout(){
		var self = this;
		let securityService = (self.security as typeof SecurityService);
		securityService.logout();
		this.$router.replace('/');
	}

	destroyed () {
	}

}
