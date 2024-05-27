export interface UserInterface {
	id: string;
	nickname: string;
	status: string;
	avatar: File;
	rooms: string[];
}

// export class User {
// 	constructor(private user: UserInterface) {	};

// 	getNickName() : string {
// 		return this.user.nickname;
// 	}
// 	getStatus() : string {
// 		return this.user.status;
// 	}
// 	getIntraID() : string {
// 		return this.user.intraId;
// 	}
// 	getAvatar() : File {
// 		return this.user.avatar;
// 	}
// 	setNickName(newNickname: string) : void {
// 		this.user.nickname = newNickname;
// 	}
// 	setStatus(newStatus: string) : void {
// 		this.user.status = newStatus;
// 	}
// 	setIntraID(newIntraId: string) : void {
// 		this.user.intraId = newIntraId;
// 	}
// 	setAvatar(newAvatar: File) : void {
// 		this.user.avatar = newAvatar;
// 	}
// }
