import { IsAlpha, IsAlphanumeric, IsNumber, IsString, Length, IsNotEmpty, IsArray, IsOptional } from "class-validator";

export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface RoomInfo {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
}

export interface MessageInterface {
	message?: string;
	roomId: number;
	room_name: string;
	senderId: number;
	sender_name: string;
	created: Date;
	updated?: Date;
	game?: boolean;
	sender_avatar?: string;
	type: string;
	cutomMessageData?: {href: string, text: string};
}

export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: boolean; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface ErrorMessage{
	msg: string;
	status_code: number;
	room?: string;
}

export class createRoomDto{
	@IsString()
	@IsAlphanumeric()
	room_name: string;
	@IsString()
	status: string;
	@IsString()
	@IsAlphanumeric()
	@Length(3, 13)
	@IsOptional()
	username?: string;
	@IsNumber()
	@IsOptional()
	userid?: number;
	@IsString()
	password: string;
	password_bool: boolean;
}

export class messageDto{
	@IsString()
	message: string;
	
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	sender_name: string;
	@IsNumber()
	sender_id: number;
	@IsString()
	room: string;
	@IsString()
	type: string;
	customMessageData: {href: string, text: string};
	@IsString()
	sender_avatar: string;
}

export class RoomDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	name: string;
	password: string; //true or false?
}

export class DeleteRoomDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	username: string;
	@IsNumber()
	userid: number;
	@IsString()
	password: string;
}

export class CheckPasswordDto {
	@IsNumber()
	id: number;
	@IsString()
	password: string;
}

export class UpdatePasswordDto {
	@IsString()
	@IsNotEmpty()
	room?: string;
	@IsNumber()
	id: number;
	@IsString()
	oldPassword: string;
	@IsString()
	newPassword: string;
}

export class UpdateNameDto {
	@IsNumber()
	id: number;
	@IsString()
	password: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	newName: string;
}

export class JoinRoomDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room_name: string;
	@IsNumber()
	user_id: number;
	@IsString()
	password: string;
	@IsString()
	avatar: string;
}

export class LeaveRoomDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room: string
	@IsNumber()
	roomid: number
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	username: string
	@IsNumber()
	userid: number
}

export class UserActionDto {
	@IsString()
	@IsNotEmpty()
	room: string;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	username: string;
	@IsOptional()
	@IsString()
	avatar: string;
	@IsOptional()
	@IsNumber()
	userid: number;
}

export class InviteChatDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	user: string;
}

export class AddRemAdminDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room_name: string;
	@IsNumber()
	userid: number;
	@IsString()
	avatar: string;
}

export class InviteGameDto {
	@IsNumber()
	roomid: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room_name: string;
	@IsNumber()
	userid: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	userName: string;
}

export class JoinBattleDto {
	@IsNumber()
	numroom: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	room: string;
	@IsString()
	avatar: string;
}

export class UpdateRoomDto {
	@IsNumber()
	user_id: number;
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	user_name: string;
}

export class SettingsDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	roomName: string;
	@IsString()
	roomType: string;
	@IsString()
	oldPassword: string;
	@IsString()
	newPassword: string;
	@IsArray()
	admins: number[];
}

export class UpdateUsernameDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@Length(3, 13)
	sender_name: string;
}