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