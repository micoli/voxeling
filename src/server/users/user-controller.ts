import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";
import { IUser } from "./user";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";

export default class UserController {

	private database: IDatabase;
	private configs: IServerConfigurations;

	constructor(configs: IServerConfigurations, database: IDatabase) {
		this.database = database;
		this.configs = configs;
	}

	private generateToken(user: IUser) {
		return Jwt.sign({
			id: user._id,
			name: user.name,
			config: {
				rights: []
			}
		}, this.configs.jwt.jwtSecret, {
			expiresIn: this.configs.jwt.jwtExpiration
		});
	}

	public async loginUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		const email = request.payload.email;
		const password = request.payload.password;

		let user: IUser = await this.database.userModel.findOne({ email: email , source:'local'});

		if (!user) {
			return reply({
				success : false,
				message : "User does not exists."
			});
		}

		if (!user.validatePassword(password)) {
			return reply({
				success : false,
				message : "Password is invalid."
			});
		}

		reply({
			success : true,
			token: this.generateToken(user)
		});
	}

	public async createUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		try {
			request.payload.source = 'local';
			request.payload.socialId = 'local';

			let userPresent: IUser = await this.database.userModel.findOne({
				email : request.payload.email ,
				source : request.payload.source
			});

			if (userPresent) {
				return reply({
					success: false,
					message: 'user already exists'
				}).code(201);
			}

			let user: any = await this.database.userModel.create(request.payload);
			return reply({
				success: true,
				token: this.generateToken(user)
			}).code(201);

		} catch (error) {
			return reply(Boom.badImplementation(error));
		}
	}

	public async updateUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		const id = request.auth.credentials.id;

		try {
			let  user: IUser = await this.database.userModel.findByIdAndUpdate(id, { $set: request.payload }, { new: true });
			return reply(user);
		} catch (error) {
			return reply(Boom.badImplementation(error));
		}
	}

	public async deleteUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		const id = request.auth.credentials.id;
		let user: IUser = await this.database.userModel.findByIdAndRemove(id);

		return reply(user);
	}

	public async infoUser(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		const id = request.auth.credentials.id;
		let user: IUser = await this.database.userModel.findById(id);

		reply(user);
	}

	public async twitterRegister(request: Hapi.Request, reply: Hapi.ReplyNoContinue) {
		try {
			if (!request.auth.isAuthenticated) {
				return reply({
					success : false,
					message : 'Authentication failed: ' + request.auth.error.message
				});
			}

			const profile = request.auth.credentials.profile;
			let userStruct = {
				source : 'twitter',
				email : profile.username,
				socialId : profile.id,
				name : profile.displayName,
				password : 'external'
			};

			let user: IUser = await this.database.userModel.findOne({
				email : userStruct.email ,
				source :'twitter'
			});

			if (!user) {
				user = await this.database.userModel.create(userStruct);
			}

			//console.log('- profile' , profile);
			//console.log('- user' , user);
			//console.log('- token' , this.generateToken(user));

			return reply.redirect('/#/auth/callback/' + this.generateToken(user));
		} catch (error) {
			return reply(Boom.badImplementation(error));
		}
	}
}
