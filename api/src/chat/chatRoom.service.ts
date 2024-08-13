import { Injectable } from "@nestjs/common";
import { ChatMessage, Chatroom, chatRoomList, UserChatroom } from "./entities/chatRoom.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { CheckPasswordDto, DeleteRoomDto, RoomDto, UpdateNameDto, UpdatePasswordDto} from "./chatRoom.dto";
import { hash, compare } from 'bcrypt';
import { User } from "src/user/entities/user.entity";

@Injectable()
export class ChatRoomService {
	constructor(@InjectRepository(Chatroom) private readonly roomRepo: Repository<Chatroom>,
				@InjectRepository(User) private readonly userRepo: Repository<User>,
				@InjectRepository(UserChatroom) private readonly userChatroomRepo: Repository<UserChatroom>) {}

	async createChatRoom(roomDto: RoomDto) {
		// Check if room name isn't taken
		const roomNameExists: Chatroom = await this.roomRepo.findOne({
			where: {
				name: roomDto.name,
			}
		});
		if (roomNameExists)
			return null;
		// Hash password if it's not null
		var finalPassword: string = roomDto.password;
		if (finalPassword !== null) {
			finalPassword = await hash(roomDto.password, 10);
		}
		// Create chat room
		const room: Chatroom = await this.roomRepo.save({
			name: roomDto.name,
			password: finalPassword,
		});
		this.addUserToChatRoom(roomDto.ownerId, room.id, 'owner');
		// Return the created chat room id and name (not password);
		return {
			id: room.id,
			name: room.name
		};
	}

	async deleteChatRoom(deleteRoomDto: DeleteRoomDto) {
		const checkOldPassword: boolean = await this.checkPassword({
			id: deleteRoomDto.id,
			password: deleteRoomDto.password
		});
		if (!checkOldPassword)
			return false;
		await this.roomRepo.delete({id: deleteRoomDto.id});
		await this.userChatroomRepo.delete({chatroom: {id: deleteRoomDto.id}});
		return true;
	}
	
	async getAllChatRooms(): Promise<Chatroom[]> {
		return this.roomRepo.find({
			select: {
				id: true,
				name: true,
				userChatrooms: true,
			},
			relations: {
				userChatrooms: {
					user: true
				}
			}
		});
	}

	async checkPassword(checkPasswordDto: CheckPasswordDto): Promise<boolean> {
		// Check if chat room exists
		const room: Chatroom = await this.roomRepo.findOne({
			where: {
				id: checkPasswordDto.id
			}
		});
		if (!room)
			return false;
		// Any password is ok if the room password is null (room is not protected)
		if (room.password === null)
			return true;
		// If the given password is null and the room password isn't, the password is wrong
		if (checkPasswordDto.password === null)
			return false;
		return await compare(checkPasswordDto.password, room.password);
	}
	
	async updatePassword(updatePasswordDto: UpdatePasswordDto) {
		// Password can only be updated if the old password is provided
		const checkOldPassword: boolean = await this.checkPassword({
			id: updatePasswordDto.id,
			password: updatePasswordDto.oldPassword
		});
		if (!checkOldPassword)
			return false;
		// Hash password if it's not null
		var newPassword: string = updatePasswordDto.newPassword;
		if (newPassword !== null) {
			newPassword = await hash(updatePasswordDto.newPassword, 10);
		}
		// update the password
		this.roomRepo.update({
			id: updatePasswordDto.id
			}, {
				password: newPassword
			}
		);

		return true;
	}
	
	async updateName(updateNameDto: UpdateNameDto) {
		// Password can only be updated if the old password is provided
		const checkPassword: boolean = await this.checkPassword({
			id: updateNameDto.id,
			password: updateNameDto.password
		});
		if (!checkPassword)
			return false;
		// Check if room name isn't taken
		const roomNameExists: Chatroom = await this.roomRepo.findOne({
			where: {
				name: updateNameDto.newName,
			}
		});
		if (roomNameExists)
			return false;
		this.roomRepo.update({
			id: updateNameDto.id
			}, {
				name: updateNameDto.newName
			}
		);
		return true;
	}

	// Adds user the the userchatroom table
	// Returns null if the user or the chatroom isn't found
	async addUserToChatRoom(userId: number, roomId: number, role: string): Promise<UserChatroom | null> {
		console.log("adding user:", userId, roomId, role);
		const exists: UserChatroom = await this.findUserInChatRoom(userId, roomId);
		if (exists) {
			return (null);
		}
		const user: User = await this.userRepo.findOne({where: {id: userId}});
		if (!user) {
			return null;
		}
		const room: Chatroom = await this.roomRepo.findOne({where: {id: roomId}});
		if (!room) {
			return null;
		}
		const userChatRoom: UserChatroom = this.userChatroomRepo.create({
			user: user,
			chatroom: room,
			role: role,
		});
		console.log("User", user.nickname, "added to room", room.name);
		return await this.userChatroomRepo.save(userChatRoom);
	}

	// Removes the user from the given room
	async removeUserFromChatRoom(userId: number, roomId: number): Promise<void> {
		await this.userChatroomRepo.delete({
			user: {id: userId},
			chatroom: {id: roomId}
		});
	}

	// Returns the user in chatroom
	// Return null if user is not in chatroom
	async findUserInChatRoom(userId: number, roomId: number): Promise<UserChatroom | null> {
		const userChatRoom: UserChatroom = await this.userChatroomRepo.findOne({
			where: {
				user: {id: userId},
				chatroom: {id: roomId},
			}
		});
		if (!userChatRoom) {
			return null;
		}
		return userChatRoom;
	}
	
	// Returns an array of all users in a room
	async getAllUsersInRoom(roomId: number) {
		return await this.userChatroomRepo.find({
			select: {
				role: true,
				muted: true,
				user: {
					id: true,
					nickname: true
				}
			},
			where: {
				chatroom: {id: roomId}
			},
			relations: {
				user: true
			}
			
		})
	}

	// Returns an array of all users in a room with the given role (owner/admin/user/banned)
	async getAllUsersWithRoleInRoom(roomId: number, role: string) {
		return await this.userChatroomRepo.find({
			select: {
				role: true,
				muted: true,
				user: {
					id: true,
					nickname: true
				}
			},
			
			where: {
				role: role,
				chatroom: {id: roomId}
			},
			relations: {
				user: true
			}
			
		})
	}


	// NOT TESTED
	async getAllRoomsOfUser(userId: number) {
		return await this.userChatroomRepo.find({
			select: {
				chatroom: {
					id: true,
					name: true,
				}
			},
			where: [
				{user: {id: userId}, role: "admin"},
				{user: {id: userId}, role: "owner"},
				{user: {id: userId}, role: "user"},
			],
			relations: {
				chatroom: true
			}
		})
	}

	// Updates the user role in a room
	// Return null if user is not in chatroom
	async updateUserRole(userId: number, roomId: number, role: string): Promise<UserChatroom | null> {
		var userChatRoom: UserChatroom = await this.findUserInChatRoom(userId, roomId);
		if (!userChatRoom) {
			return null;
		}
		userChatRoom.role = role;
		return await this.userChatroomRepo.save(userChatRoom);
	}
	
	// Checks whether the user has a role inside a room. For example to check if they're admin or banned
	// Return null if user is not in chatroom
	async checkRole(userId: number, roomId: number, role: string): Promise<boolean | null> {
		const userChatRoom: UserChatroom = await this.findUserInChatRoom(userId, roomId);
		if (!userChatRoom) {
			return null;
		}
		if (role === 'admin' && userChatRoom.role === 'owner') {
			return true;
		}
		return (userChatRoom.role === role);
	}
	
	// Checks wether the user is muted
	// Return null if user is not in chatroom
	async checkMuted(userId: number, roomId: number): Promise<boolean | null> {
		const userChatRoom: UserChatroom = await this.findUserInChatRoom(userId, roomId);
		if (!userChatRoom) {
			return null;
		}
		return userChatRoom.muted;
	}
	
	// If the user is muted, they are unmuted. If the user is NOT muted, they are muted
	// Return null if user is not in chatroom
	async toggleMute(userId: number, roomId: number): Promise<UserChatroom | null> {
		var userChatRoom: UserChatroom = await this.findUserInChatRoom(userId, roomId);
		if (!userChatRoom) {
			return null;
		}
		// the owner or admins can not be muted?
		if (userChatRoom.role === 'admin' || userChatRoom.role === 'owner') {
			return userChatRoom;
		}
		if (userChatRoom.muted == true) {
			userChatRoom.muted = false;
		} else {
			userChatRoom.muted = true;
		}
		return await this.userChatroomRepo.save(userChatRoom);
	}
}