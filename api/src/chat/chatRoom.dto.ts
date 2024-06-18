export interface Rooms {
	id: string;
	name: string;
	owner: string;
	admins: string[];
	banned?: string[];
	muted?: Record<string, Date>;
	users: string[];
	status: string; //public, private
	password: string; //true or false?
	created?: Date;
	updated?: Date;
	messages?: MessageInterface[];
}

export interface userDto {
	roomId: string;
	nickname: string;
	socketId: string;
	isAdmin: boolean;
}

export interface MessageInterface {
	message: string;
	roomId: string;
	senderId: number;
	created: string;
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