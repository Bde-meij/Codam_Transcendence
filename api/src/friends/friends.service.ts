import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './entities/friend.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendsService {
	constructor(@InjectRepository(Friend) private readonly friendRepo: Repository<Friend>, private readonly userService: UserService) {}

	async create(createFriendRequestDto: CreateFriendRequestDto): Promise<Friend> {
		const sender: User = await this.userService.findUserById(createFriendRequestDto.sender);
		if (!sender) {
			throw new HttpException('Sender id not found', 404);
		}
		const target: User = await this.userService.findUserById(createFriendRequestDto.target);
		if (!target) {
			throw new HttpException('Target id not found', 404);
		}

		return await this.friendRepo.save({
			sender: sender,
			target: target
		})
	}

	findAll() {
		return `This action returns all friends`;
	}

	findOne(id: number) {
		return `This action returns a #${id} friend`;
	}

	update(id: number, updateFriendDto: UpdateFriendDto) {
		return `This action updates a #${id} friend`;
	}

	remove(id: number) {
		return `This action removes a #${id} friend`;
	}
}
