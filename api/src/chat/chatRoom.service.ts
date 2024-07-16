import { Injectable } from "@nestjs/common";
import { ChatRoom } from "./entities/chatRoom.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { CheckPasswordDto, RoomDto, UpdateNameDto, UpdatePasswordDto } from "./chatRoom.dto";
import { hash, compare } from 'bcrypt';

@Injectable()
export class ChatRoomService {
	constructor(@InjectRepository(ChatRoom) private readonly roomRepo: Repository<ChatRoom>) {}

	async createChatRoom(roomDto: RoomDto) {
		// Check if room name isn't taken
		const roomNameExists: ChatRoom = await this.roomRepo.findOne({
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
		const room: ChatRoom = await this.roomRepo.save({
			name: roomDto.name,
			password: finalPassword,
		});
		// Return the created chat room id and name (not password);
		return {
			id: room.id,
			name: room.name
		};
	}

	async deleteChatRoom(roomId: number) {
		await this.roomRepo.delete({id: roomId});
	}
	
	async checkPassword(checkPasswordDto: CheckPasswordDto): Promise<boolean> {
		// Check if chat room exists
		const room: ChatRoom = await this.roomRepo.findOne({
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
		const roomNameExists: ChatRoom = await this.roomRepo.findOne({
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
}