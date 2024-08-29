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

export interface ErrorMessage{
	msg: string;
	status_code: number;
	room?: string;
}

export interface getAllUsersInRoomDTO{
	role: string;
	muted: boolean
	user: {
		id: number,
		nickname: string,
	}
}
