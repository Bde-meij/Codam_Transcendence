import { Injectable, Res, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  	async userExists(id: string) {
		const user = await this.userRepo.findOne({where: {id}});
		if (user)
			return true;
		return false;
	} 

	async createUser(userData: any) {
		const savedUser = await this.userRepo.save(userData);
		return savedUser;
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

	async updateStatus(id: string, newStatus: string) {
		await this.userRepo.update(id, {status: newStatus});
	}

	async updateAvatar(id: string, newAvatar: string) {
		await this.userRepo.update(id, {avatar: newAvatar});
	}
}
