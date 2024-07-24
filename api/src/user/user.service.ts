import { Injectable, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  	async userExists(userId: number) {
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

	async findUserById(userId: number) {
		const user = await this.userRepo.findOne({where: {id: userId}});
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
	
	async get2faEnabled(userId: number) {
		return await this.userRepo.findOne({
			select: {
				isTwoFAEnabled: true
			},
			where: {
				id: userId
			}
		})
	}

	async get2faSecret(userId: number) {
		return await this.userRepo.findOne({
			select: {
				twoFASecret: true
			},
			where: {
				id: userId
			}
		})
	}

	async getAvatar(userId: number) {
		return await this.userRepo.findOne({
			select: {
				avatar: true
			},
			where: {
				id: userId
			}
		})
	}

	async updateName(userId: number, newName: string) {
		await this.userRepo.update({id: userId}, {nickname: newName});
	}
	
	async updateStatus(userId: number, newStatus: string) {
		await this.userRepo.update({id: userId}, {status: newStatus});
	}

	async updateAvatar(userId: number, newAvatar: string) {
		await this.userRepo.update({id: userId}, {avatar: newAvatar});
	}

	async updateTwoFASecret(userId: number, secret: any) {
		await this.userRepo.update({id: userId}, {twoFASecret: secret.base32});
	}
	
	async enableTwoFA(userId: number) {
		await this.userRepo.update({id: userId}, {isTwoFAEnabled: true});
	}
	
	async disableTwoFA(userId: number) {
		await this.userRepo.update({id: userId}, {isTwoFAEnabled: false});
	}

	async updateTwoFA(userId: number, enabled: boolean, secret: any) {
		await this.userRepo.update({id: userId}, {
			isTwoFAEnabled: enabled,
			twoFASecret: secret.base32
		})
	}

	async updateNickname(userId: number, newName: string) {
		await this.userRepo.update({id: userId}, {nickname: newName});
	}

	async updateRoomKey(userId: number, roomKey: number) {
		if (!await this.userExists(userId))
			throw new HttpException("User not found!", 404);
		await this.userRepo.update({id: userId}, {roomKey: roomKey});
	}
}
