import { Injectable, Res, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as speakeasy from 'speakeasy';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  	async userExists(id: string) {
		const user = await this.userRepo.findOne({where: {id}});
		if (user)
			return true;
		return false;
	} 

	async createUser(userData: CreateUserDto): Promise<User> {
		const userIdExists = await this.userRepo.findOne({where: {id: userData.id}})
		if (userIdExists) {
			throw new HttpException('Id already in use!', 400);
		}
		const userNameExists = await this.userRepo.findOne({where: {nickname: userData.nickname}})
		if (userNameExists) {
			throw new HttpException('Nickname already in use!', 400);
		}
		const savedUser = await this.userRepo.save({
			id: userData.id,
			nickname: userData.nickname,
		});
		return savedUser;
	}

	async createUsers(users: CreateUserDto[]): Promise<User[]> {
		return await this.userRepo.save(users);
	}

	async findUserById(id: string) {
		const user = await this.userRepo.findOne({where: {id}});
		return user;
	}

	async findUserByName(name: string) {
		const user = await this.userRepo.findOne({where: {nickname :name}});
		console.log(user);
		return user;
	}

	async findAllUsers(): Promise<User[]> {
		return await this.userRepo.find();
	}

	async updateName(id: string, newName: string) {
		await this.userRepo.update(id, {nickname: newName});
	}

	async updateStatus(id: string, newStatus: string) {
		await this.userRepo.update(id, {status: newStatus});
	}

	async updateAvatar(id: string, newAvatar: string) {
		await this.userRepo.update(id, {avatar: newAvatar});
	}

	async updateTwoFASecret(id: string, secret: any) {
		await this.userRepo.update(id, {twoFASecret: secret.base32});
	}

	async enableTwoFA(id: string) {
		await this.userRepo.update(id, {isTwoFAEnabled: true});
	}

	async disableTwoFA(id: string) {
		await this.userRepo.update(id, {isTwoFAEnabled: false});
	}
}
