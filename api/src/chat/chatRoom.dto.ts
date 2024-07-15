export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<number, Date>;
	users: number[];
	status: string; //public, private
	password: string; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface RoomInfo {
	room_id: number;
	nickname: string;
	Owner: boolean;
	Admin: boolean;
	socket_id: string;
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
}

export interface Room_dto {
	id: number;
	password: string; //true or false?
}
