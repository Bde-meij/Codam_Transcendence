import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest, FriendStatus } from './entities/friend.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Loggary } from "src/logger/logger.service";

@Injectable()
export class FriendsService {
	constructor(@InjectRepository(FriendRequest) private readonly friendRepo: Repository<FriendRequest>, private readonly userService: UserService, private loggary: Loggary) {}

	async create(createFriendRequestDto: CreateFriendRequestDto): Promise<any> {
		if (createFriendRequestDto.sender === createFriendRequestDto.target) {
			this.loggary.warn('Friend request cannot be sent to yourself! User id:', createFriendRequestDto.sender);
			throw new HttpException('Friend request cannot be sent to yourself', 400);
		}
		const sender: User = await this.userService.findUserById(createFriendRequestDto.sender);
		if (!sender) {
			this.loggary.warn('Sender id not found! Sender id:', createFriendRequestDto.sender);
			throw new HttpException('Sender id not found', 404);
		}
		const target: User = await this.userService.findUserById(createFriendRequestDto.target);
		if (!target) {
			this.loggary.warn('Target id not found! Target id:', createFriendRequestDto.target);
			throw new HttpException('Target id not found', 404);
		}
		// Add check for if target has sender blocked. blocking should also delete any request between the 2 users
		// (not required by subject)
		const alreadyExists: FriendRequest = await this.friendRepo.findOne({
			where: [
				{sender: sender, target: target},
				{sender: target, target: sender}
			]
		});
		if (alreadyExists) {
			if (alreadyExists.status === FriendStatus.PENDING) {
				this.loggary.warn('Request already pending!');
				throw new HttpException('Request already pending', 400);
			}
			if (alreadyExists.status === FriendStatus.ACCEPTED) {
				this.loggary.warn('Request already accepted!');
				throw new HttpException('Request already accepted', 400);
			}
		}
		const request = await this.friendRepo.save({
			sender: sender,
			target: target
		});
		this.loggary.verbose('Request created:\n', request);
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
			this.loggary.warn('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		if (request.sender.id !== userId && request.target.id !== userId) {
			this.loggary.warn('This friend request is not yours!');
			throw new HttpException('This friend request is not yours', 401);
		}
		await this.friendRepo.delete({id: requestId});
		this.loggary.verbose("Request deleted:\n", request);
	}
	
	async deleteByUserId(userId: string, targetId: string) {
		const request: FriendRequest = await this.friendRepo.findOne({
			where: [
				{sender: {id: userId}, target: {id: targetId}},
				{target: {id: userId}, sender: {id: targetId}},
			],
		});
		if (!request) {
			this.loggary.warn('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		await this.friendRepo.delete({id: request.id});
		this.loggary.verbose("Request deleted:\n", request);
	}
	
	async updateStatus(userId: string, requestId: string, status: FriendStatus) {
		const updatedRequests: FriendRequest = await this.friendRepo.findOne({
			where: {
				id: requestId,
				target: {id: userId}
			}
		});
		if (!updatedRequests) {
			this.loggary.warn('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		await this.friendRepo.update(
			{id: requestId},
			{status: status}
		);	
	}
	
	async findIncoming(targetId: string): Promise<FriendRequest[]> {
		const target: User = await this.userService.findUserById(targetId);
		if (!target) {
				this.loggary.warn('Target id not found! Target id:', targetId);
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
		this.loggary.verbose('Incoming requests:\n', incomingRequests);
		return (incomingRequests);
	}
	
	async findOutgoing(senderId: string): Promise<FriendRequest[]> {
		const sender: User = await this.userService.findUserById(senderId);
		if (!sender) {
			this.loggary.warn('Sender id not found! Sender id:', senderId);
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
		this.loggary.verbose('Outgoing requests:\n', outgoingRequests);
		return (outgoingRequests);
	}

	async findFriends(userId: string): Promise<User[]> {
		const user: User = await this.userService.findUserById(userId);
		if (!user) {
			this.loggary.warn('User not found! User id:', userId);
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
		this.loggary.verbose('Friends:\n', friends);
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
