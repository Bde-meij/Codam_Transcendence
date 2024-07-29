import { HttpException, Injectable } from '@nestjs/common';
import { CreateFriendIdRequestDto, CreateFriendNickRequestDto } from './dto/create-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest, FriendStatus } from './entities/friend.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FriendsService {
	constructor(@InjectRepository(FriendRequest) private readonly friendRepo: Repository<FriendRequest>, private readonly userService: UserService) {}

	async createNick(createFriendNickRequestDto: CreateFriendNickRequestDto): Promise<any> {
		const target: User = await this.userService.findUserByName(createFriendNickRequestDto.target);
		if (!target) {
			throw new HttpException('Target user not found', 404);
		}
		const createFriendIdRequestDto: CreateFriendIdRequestDto = {
			sender: createFriendNickRequestDto.sender,
			target: target.id
		}
		return await this.create(createFriendIdRequestDto);
	}

	async create(createFriendIdRequestDto: CreateFriendIdRequestDto): Promise<any> {
		if (createFriendIdRequestDto.sender === createFriendIdRequestDto.target) {
			// console.log('Friend request cannot be sent to yourself! User id:', createFriendIdRequestDto.sender);
			throw new HttpException('Friend request cannot be sent to yourself', 400);
		}
		const sender: User = await this.userService.findUserById(createFriendIdRequestDto.sender);
		if (!sender) {
			// console.log('Sender id not found! Sender id:', createFriendIdRequestDto.sender);
			throw new HttpException('Sender id not found', 404);
		}
		const target: User = await this.userService.findUserById(createFriendIdRequestDto.target);
		if (!target) {
			// console.log('Target id not found! Target id:', createFriendIdRequestDto.target);
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
				// console.log('Request already pending!');
				throw new HttpException('Request already pending', 400);
			}
			if (alreadyExists.status === FriendStatus.ACCEPTED) {
				// console.log('Request already accepted!');
				throw new HttpException('Request already accepted', 400);
			}
		}
		const request = await this.friendRepo.save({
			sender: sender,
			target: target
		});
		// console.log('Request created:\n', request);
		return {
			id: request.id,
			status: request.status,
			target: {
				id: request.target.id,
				nickname: request.target.nickname,
			}
		};
	}

	async deleteByRequestId(userId: number, requestId: number) {
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
			// console.log('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		if (request.sender.id != userId && request.target.id != userId) {
			// console.log('This friend request is not yours!');
			throw new HttpException('This friend request is not yours', 401);
		}
		await this.friendRepo.delete({id: requestId});
		// console.log("Request deleted:\n", request);
	}
	
	async deleteByUserId(userId: number, targetId: number) {
		const request: FriendRequest = await this.friendRepo.findOne({
			where: [
				{sender: {id: userId}, target: {id: targetId}},
				{target: {id: userId}, sender: {id: targetId}},
			],
		});
		if (!request) {
			// console.log('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		await this.friendRepo.delete({id: request.id});
		// console.log("Request deleted:\n", request);
	}
	
	async updateStatus(userId: number, requestId: number, status: FriendStatus) {
		const updatedRequests: FriendRequest = await this.friendRepo.findOne({
			where: {
				id: requestId,
				target: {id: userId}
			}
		});
		if (!updatedRequests) {
			// console.log('Friend request not found!');
			throw new HttpException('Friend request not found', 404);
		}
		await this.friendRepo.update(
			{id: requestId},
			{status: status}
		);	
	}
	
	async findIncoming(targetId: number): Promise<FriendRequest[]> {
		const target: User = await this.userService.findUserById(targetId);
		if (!target) {
				// console.log('Target id not found! Target id:', targetId);
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
		// console.log('Incoming requests:\n', incomingRequests);
		return (incomingRequests);
	}
	
	async findOutgoing(senderId: number): Promise<FriendRequest[]> {
		const sender: User = await this.userService.findUserById(senderId);
		if (!sender) {
			// console.log('Sender id not found! Sender id:', senderId);
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
		// console.log('Outgoing requests:\n', outgoingRequests);
		return (outgoingRequests);
	}

	async findFriends(userId: number): Promise<User[]> {
		const user: User = await this.userService.findUserById(userId);
		if (!user) {
			// console.log('User not found! User id:', userId);
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
		// console.log('Friends:\n', friends);
		return friends;
	}

	async isFriendsUserId(userId: number, targetId: number): Promise<boolean> {
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
