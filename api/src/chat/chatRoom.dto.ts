export interface Rooms {
	id: number;
	name: string;
	owner: number;
	admins: number[];
	banned?: number[];
	muted?: Record<string, Date>;
	users: string[];
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
	created: Date;
	updated?: Date;
	game?: boolean;
}

// export interface ConnectedInterface {
// 	id?: number;
// 	socketId: string;
// 	user: UserInterface;
//   }
  
// export interface UserInterface {
// 	id: number
// 	username?: string;
// 	users?: UserInterface
// 	blockedUsers?: number[]
// 	picture?: string
// 	sizedPicture?: string
// 	jwt?: string
// }