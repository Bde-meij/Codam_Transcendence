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

  	async userExists(userId: string) {
		const user = await this.userRepo.findOne({
			select: {
				id: true
			},
			where: {
				id : userId
			}
		});
		if (user)
			return true;
		return false;
	}
	
	async createUser(userData: CreateUserDto): Promise<User> {
		console.error("NEW USER 2:", userData);
		const userExists = await this.userRepo.findOne({
			select: {
				id: true,
			},
			where: [
				{id: userData.id},
				{nickname: userData.nickname}
			]
		})
		if (userExists && userExists.id === userData.id) {
			throw new HttpException('Id already in use!', 403);
		}
		if (userExists && userExists.nickname === userData.nickname) {
			throw new HttpException('Nickname already in use!', 403);
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
	
	async get2faEnabled(id: string) {
		return await this.userRepo.findOne({
			select: {
				isTwoFAEnabled: true
			},
			where: {
				id: id
			}
		})
	}

	async get2faSecret(id: string) {
		return await this.userRepo.findOne({
			select: {
				twoFASecret: true
			},
			where: {
				id: id
			}
		})
	}

	async getAvatar(id: string) {
		return await this.userRepo.findOne({
			select: {
				avatar: true
			},
			where: {
				id: id
			}
		})
	}

	async updateName(userId: string, newName: string) {
		await this.userRepo.update(userId, {nickname: newName});
	}
	
	async updateStatus(userId: string, newStatus: string) {
		await this.userRepo.update(userId, {status: newStatus});
	}

	async updateAvatar(userId: string, newAvatar: string) {
		await this.userRepo.update(userId, {avatar: newAvatar});
	}

	async updateTwoFASecret(userId: string, secret: any) {
		await this.userRepo.update(userId, {twoFASecret: secret.base32});
	}
	
	async enableTwoFA(userId: string) {
		await this.userRepo.update(userId, {isTwoFAEnabled: true});
	}
	
	async disableTwoFA(userId: string) {
		await this.userRepo.update(userId, {isTwoFAEnabled: false});
	}

	async updateTwoFA(userId: string, enabled: boolean, secret: any) {
		await this.userRepo.update(userId, {
			isTwoFAEnabled: enabled,
			twoFASecret: secret.base32
		})
	}

	async updateNickname(userId: string, newName: string) {
		await this.userRepo.update(userId, {nickname: newName});
	}

	async updateRoomKey(userId: string, roomKey: number) {
		if (!await this.userExists(userId))
			throw new HttpException("User not found!", 404);
		await this.userRepo.update({id: userId}, {roomKey: roomKey});
	}
}
