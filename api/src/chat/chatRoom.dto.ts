export interface ChatRoomListDto {
	roomId: string;
	roomName: string;
	RoomOwner: string;
	adminList: string[];
	banList: string[];
	muteList: string[];
	status: string;
	password: string | null;
	created?: Date;
	updated?: Date;
}

export interface userDto {
	roomId: string;
	nickname: string;
	socketId: string;
	isAdmin: boolean;
}

export interface MessageInterface {
	message: string;
	channelId: string;
	senderId: number;
	channelIdList: number[];
	blockedUsers: string;
	sizedPicture?: string;
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