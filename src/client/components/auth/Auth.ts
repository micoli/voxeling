import { Vue, Component } from 'vue-property-decorator';
import {SecurityService} from '../../services/Security';
import {LocalStorage} from '../../services/LocalStorage';

@Component({
	template: `
	<div class="login">
		<div class="login_wrapper">
			<div class="animate form" v-show="mode=='login'">
				<section class="login_content">
					<form @submit="login">
						<h1>Login Form</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" v-model="credentials.username" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" v-model="credentials.password" />
						</div>
						<div>
							<button type="submit" class="btn btn-default submit" @click="login">Log in</button>
							<a class="reset_pass" @click="displayLostPassword">Lost your password?</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">New to site?
							<a href="#" @click.prevent="displayRegister" class="to_register"> Create Account </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>
			<div class="animate form " v-show="mode=='register'">
				<section class="login_content">
					<form @submit="register">
						<h1>Create Account</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username" required="" />
						</div>
						<div>
							<input type="email" class="form-control" placeholder="Email" required="" />
						</div>
						<div>
							<input type="password" class="form-control" placeholder="Password" required="" />
						</div>
						<div>
							<a class="btn btn-default submit" href="index.html">Submit</a>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">Already a member ?
							<a href="#" @click.prevent="displayLogin" class="to_register"> Log in </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>
			<div class="animate form" v-show="mode=='lostPassword'">
				<section class="login_content">
					<form @submit="login">
						<h1>Lost password Form</h1>
						<div>
							<input type="text" class="form-control" placeholder="Username or email" required="" v-model="credentials.username" />
						</div>
						<div>
							<button type="submit" class="btn btn-default submit" @click="lostPassword">send email</button>
						</div>

						<div class="clearfix"></div>

						<div class="separator">
							<p class="change_link">Already a member ?
							<a href="#" @click.prevent="displayLogin" class="to_register"> Log in </a>
							</p>

							<div class="clearfix"></div>
							<br />
						</div>
					</form>
				</section>
			</div>

		</div>
		<div class="clearfix"></div>
	</div>`,
	components: {
	}
})
export default class Auth extends Vue {
	credentials:any= {
		username: 'toto@titi.com',
		password: 'toto'
	};
	rememberCredentials:boolean=true;
	error:string =  '';
	mode:string='login';

	displayRegister(){
		this.mode='register';
	}

	displayLogin(){
		this.mode='login';
	}

	displayLostPassword(){
		this.mode='lostPassword';
	}

	lostPassword(){
	}

	login(){
		let self = this;
		let credentials = {
			username: this.credentials.username.toLowerCase(),
			password: this.credentials.password
		};

		let securityService = (this.security as typeof SecurityService);

		securityService
		.login(credentials)
		.then(function(data: any) {
			if (self.rememberCredentials && credentials.username && credentials.password) {
				LocalStorage.setItem("credentials", JSON.stringify({
					username : credentials.username,
					password : credentials.password
				}));
			} else {
				LocalStorage.removeItem("credentials");
			}
			securityService.finishAuth()
		}, function(e:any) {
			console.log('error',e);
		}).catch(function(data: any) {
			console.log('error',data);
		});
	}

	register(){
		let self = this;
		let credentials = {
			username: this.credentials.username.toLowerCase(),
			password: this.credentials.password
		};

		let securityService = (this.security as typeof SecurityService);
	}
	destroyed () {
	}
}
