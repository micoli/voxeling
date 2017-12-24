import { Vue, Component, Provide, Prop } from 'vue-property-decorator';
import {SecurityService} from '../../services/Security';

@Component({
	template: `
	<li role="presentation" class="dropdown" v-if="username">
		<a href="javascript:;" class="dropdown-toggle info-number" data-toggle="dropdown" aria-expanded="false">
			<i class="fa fa-envelope-o"></i>
			<span class="badge bg-green">{{ _nbMessages }}</span>
		</a>
		<ul id="menu1" class="dropdown-menu list-unstyled msg_list" role="menu">
			<li v-for="message in _messages">
				<a>
					<span class="image"><img :src="message.fromPic" alt="Profile Image" /></span>
					<span>
						<span>{{ message.from }}</span>
						<span class="time">{{ message.time }}</span>
					</span>
					<span class="message">
						{{ message.message }}
					</span>
				</a>
			</li>
			<li>
				<div class="text-center">
					<a>
						<strong><a href="#" @click.prevent="seeAll">See All Alerts</a></strong>
						<i class="fa fa-angle-right"></i>
					</a>
				</div>
			</li>
		</ul>
	</li>`
})
export default class ProfileMessagesMenu extends Vue {
	username:string='';

	@Prop()
	nbMessages:number=0;

	@Prop()
	messages: any[]=[{
		from:"John Doe",
		fromPic:"http://pipsum.com/20x20.jpg",
		time:"",
		message:""
	}];

	_nbMessages:number;
	_messages:any[];

	seeAll(){

	}

	mounted () {
		var self = this;
		this._messages=this.messages;
		this._nbMessages=this.nbMessages;
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
}
