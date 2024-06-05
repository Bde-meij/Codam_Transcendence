import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest, FriendStatus } from './entities/friend.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendsService {
	constructor(@InjectRepository(FriendRequest) private readonly friendRepo: Repository<FriendRequest>, private readonly userService: UserService) {}

	async create(createFriendRequestDto: CreateFriendRequestDto): Promise<any> {
		if (createFriendRequestDto.sender === createFriendRequestDto.target) {
			throw new HttpException('Friend request cannot be sent to yourself', 400);
		}
		const sender: User = await this.userService.findUserById(createFriendRequestDto.sender);
		if (!sender) {
			throw new HttpException('Sender id not found', 404);
		}
		const target: User = await this.userService.findUserById(createFriendRequestDto.target);
		if (!target) {
			throw new HttpException('Target id not found', 404);
		}
		const alreadyExists: FriendRequest = await this.friendRepo.findOne({
			where: [
				{sender: sender, target: target},
				{sender: target, target: sender}
			]
		});
		if (alreadyExists) {
			if (alreadyExists.status === FriendStatus.PENDING) {
				throw new HttpException('Request already pending', 400);
			}
			if (alreadyExists.status === FriendStatus.ACCEPTED) {
				throw new HttpException('Request already accepted', 400);
			}
			if (alreadyExists.status === FriendStatus.DECLINED) {
				throw new HttpException('Request already declined', 400);
			}
		}
		const request = await this.friendRepo.save({
			sender: sender,
			target: target
		});
		return {
			id: request.id,
			status: request.status,
			target: {
				id: request.target.id,
				nickname: request.target.nickname,
			}
		};
	}

	async deleteByRequestId(userId: string, requestId: string) {
		const request: FriendRequest = await this.friendRepo.findOne({
			where: {
				id: requestId
			},
			relations: {
				sender: true,
				target: true
			}
		});
		if (!request) {
			throw new HttpException('Friend request not found', 404);
		}
		if (request.sender.id !== userId && request.target.id !== userId) {
			throw new HttpException('This friend request is not yours', 401);
		}
		await this.friendRepo.delete({id: requestId});
	}
	
	async deleteByUserId(userId: string, targetUserId: string) {
		const request: FriendRequest = await this.friendRepo.findOne({
			where: [
				{sender: {id: userId}, target: {id: targetUserId}},
				{target: {id: userId}, sender: {id: targetUserId}},
			],
		});
		if (!request) {
			throw new HttpException('Friend request not found', 404);
		}
		await this.friendRepo.delete({id: request.id});
	}
	
	async updateStatus(userId: string, requestId: string, status: FriendStatus) {
		const updatedRequests: FriendRequest = await this.friendRepo.findOne({
			where: {
				id: requestId
			},
			relations: {
				sender: true,
				target: true
			}
		});
		if (!updatedRequests) {
			throw new HttpException('Friend request not found', 404);
		}
		if (updatedRequests.target.id !== userId) {
			throw new HttpException('This friend request is not yours', 401);
		}
		await this.friendRepo.update(
			{id: requestId},
			{status: status}
		);	
	}
	
	async findIncoming(targetId: string): Promise<FriendRequest[]> {
		const target: User = await this.userService.findUserById(targetId);
		if (!target) {
			throw new HttpException('Target not found', 404);
		}
		const incomingRequests: FriendRequest[] = await this.friendRepo.find({
			select: {
				sender: {
					id: true,
					nickname: true,
				}
			},
			where: {
				target: target,
				status: FriendStatus.PENDING
			},
			relations: {
				sender: true,
			}
		});
		return (incomingRequests);
	}
	
	async findOutgoing(senderId: string): Promise<FriendRequest[]> {
		const sender: User = await this.userService.findUserById(senderId);
		if (!sender) {
			throw new HttpException('Sender not found', 404);
		}
		const outgoingRequests: FriendRequest[] = await this.friendRepo.find({
			select: {
				target: {
					id: true,
					nickname: true,
				}
			},
			where: {
				sender: sender,
				status: FriendStatus.PENDING
			},
			relations: {
				target: true
			}
		});
		return (outgoingRequests);
	}

	async findFriends(userId: string): Promise<User[]> {
		const user: User = await this.userService.findUserById(userId);
		if (!user) {
			throw new HttpException('User not found', 404);
		}
		const recievedFriends: FriendRequest[] = await this.friendRepo.find({
			select: {
				sender: {
					id: true,
					nickname: true,
					status: true,
				}
			},
			where: {
				target: {
					id: userId
				},
				status: FriendStatus.ACCEPTED,
			},
			relations: {
				sender: true,
			}
		});
		const sentFriends: FriendRequest[] = await this.friendRepo.find({
			select: {
				target: {
					id: true,
					nickname: true,
					status: true,
				}
			},
			where: {
				sender: {
					id: userId
				},
				status: FriendStatus.ACCEPTED,
			},
			relations: {
				target: true,
			}
		});
		const friends: User[] = [
			...sentFriends.map(request => request.target),
			...recievedFriends.map(request => request.sender),
		];
		return friends;
	}

	async isFriendsUserId(userId: string, targetId: string): Promise<boolean> {
		const request = await this.friendRepo.findOne({
			where: [
				{sender: {id: userId}, target: {id: targetId}},
				{sender: {id: targetId}, target: {id: userId}},
			]
		})
		if (!request || request.status !== FriendStatus.ACCEPTED)
			return false;
		return true;
	}
}
