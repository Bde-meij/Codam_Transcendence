import { IsAlphanumeric, IsNumber, isNumber } from "class-validator";

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

export interface createRoomDto{
	room_name: string,
	status: string, 
	password: string,
	password_bool: boolean,
}

export class messageDto{
	@IsAlphanumeric()
	message: string;
	
	@IsAlphanumeric()
	sender_name: string;
	@IsNumber()
	sender_id: number;
	room: string;
	type: string;
	customMessageData: {href: string, text: string};
	sender_avatar: string;
}
	
export interface RoomDto {
	name: string;
	password: string; //true or false?
}

export interface DeleteRoomDto {
	id: number;
	password: string;
}

export interface CheckPasswordDto {
	id: number;
	password: string;
}

export interface UpdatePasswordDto {
	id: number;
	oldPassword: string;
	newPassword: string;
}

export interface UpdateNameDto {
	id: number;
	password: string;
	newName: string;
}