export interface Rooms {
	id: number;
	name: string;
	owner: string;
	admins: number[];
	banned?: string[];
	users: number[];
	muted?: string[];
	status: string; //public, private
	password: string; //true or false?
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
	customMessageData?: {href: string, text: string};
}

export interface messageDto{
	message: string;
	sender_name: string;
	sender_id: number;
	room: string;
	type: string;
	customMessageData: {href: string, text: string};
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
	password: string,
	password_bool: boolean,
}