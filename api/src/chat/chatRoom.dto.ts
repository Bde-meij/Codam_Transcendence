export interface ChatRoomListDto {
	roomId: string;
	roomName: string;
	adminList: string[];
	banList: string[];
	muteList: string[];
	password: string | null;
}

export interface userDto {
	roomId: string,
	nickname: string,
	socketId: string,
	isAdmin: boolean,
}
