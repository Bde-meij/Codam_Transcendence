export interface Rooms {
	id: string;
	name: string;
	owner: string;
	admins: string[];
	banned?: string[];
	users: string[];
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
	created: string;
	updated?: Date;
	game?: boolean;
	sender_avatar?: string;
}