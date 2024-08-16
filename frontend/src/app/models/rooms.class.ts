import { User } from "./user.class";

export interface Rooms {
	id: number;
	name: string;
	owner: string;
	admins: number[];
	banned?: string[];
	users: number[];
	muted?: string[];
	status: string; //public, private
	password: boolean; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface MessageInterface {
	message: string;
	roomId: number;
	room_name: string;
	senderId: number;
	sender_name: string;
	created: Date;
	updated?: Date;
	game?: boolean;
	sender_avatar?: string;
	type: string;
	customMessageData?: {text: string, roomkey: number};
}

export interface messageDto{
	message: string;
	sender_name: string;
	sender_id: number;
	room: string;
	type: string;
	customMessageData: {text: string, roomkey: number};
	sender_avatar: string;
}

export interface ErrorMessage{
	msg: string;
	status_code: number;
	room?: string;
}

export interface createRoomDto{
	room_name: string,
	status: string, 
	username?: string,
	userid?: number,
	password: string,
	password_bool: boolean,
}

export interface Blocks {
	id: number;
	sender: User;
	target: User;
	createdAt: Date;
}

export interface getAllUsersInRoomDTO{
	role: string;
	muted: boolean
	user: {
		id: number,
		nickname: string,
	}
}
