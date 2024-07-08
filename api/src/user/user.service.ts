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
				id: userId
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
	
	// test function? (unprotected)
	async createUsers(users: CreateUserDto[]): Promise<User[]> {
		return await this.userRepo.save(users);
	}


	async findUserById(userId: string) {
		const user = await this.userRepo.findOne({
			where: {
				id: userId
			}
		});
		if (!user)
			throw new HttpException("User " + userId + " not found!", 404);
		return user;
	}
	
	async findUserByName(userName: string) {
		const user = await this.userRepo.findOne({
			where: {
				nickname : userName
			}
		});
		if (!user)
			throw new HttpException("User " + userName + " not found!", 404);
		return user;
	}

	// test function? (unprotected)
	async findAllUsers(): Promise<User[]> {
		return await this.userRepo.find();
	}
	
	async get2faEnabled(userId: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		return await this.userRepo.findOne({
			select: {
				isTwoFAEnabled: true
			},
			where: {
				id: userId
			}
		})
	}

	async get2faSecret(userId: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		return await this.userRepo.findOne({
			select: {
				twoFASecret: true
			},
			where: {
				id: userId
			}
		})
	}

	async getAvatar(userId: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		return await this.userRepo.findOne({
			select: {
				avatar: true
			},
			where: {
				id: userId
			}
		})
	}

	async updateName(userId: string, newName: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {nickname: newName});
	}
	
	async updateStatus(userId: string, newStatus: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {status: newStatus});
	}

	async updateAvatar(userId: string, newAvatar: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {avatar: newAvatar});
	}

	async updateTwoFASecret(userId: string, secret: any) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {twoFASecret: secret.base32});
	}
	
	async enableTwoFA(userId: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {isTwoFAEnabled: true});
	}
	
	async disableTwoFA(userId: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {isTwoFAEnabled: false});
	}

	async updateTwoFA(userId: string, enabled: boolean, secret: any) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {
			isTwoFAEnabled: enabled,
			twoFASecret: secret.base32
		})
	}

	async updateNickname(userId: string, newName: string) {
		if (!await this.userExists(userId))
			throw new HttpException("User " + userId + " not found!", 404);
		await this.userRepo.update(userId, {nickname: newName});
	}

	async updateRoomKey(userId: string, roomKey: number) {
		if (!await this.userExists(userId)) {
			console.error("ROOM KEY EXCEPTION IN USER SERVICE");
			throw new HttpException("User " + userId + " not found!", 404);
		}
		await this.userRepo.update({id: userId}, {roomKey: roomKey});
	}
}
