// export interface UserInterface {
// 	id: string;
// 	nickname: string;
// 	status: string;
// 	avatar: FormData; //File?
// }

// import { Rooms } from "./rooms.class";

export interface User {
	id: string;
	nickname: string;
	status: string;
	avatar: string;
}

// const FAKE_ROOMS: Rooms[] = [
// 	{ id: 1, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 2, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 3, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 4, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 5, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 6, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 7, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 8, name: 'testroom', status: 'public', users: [], admins: [], password: ""  },
// 	{ id: 9, name: 'testroom', status: 'public', users: [], admins: [], password: ""  }
// ];

// export const FAKE_FRIENDS: User[] = [
// 	{ id: 12, nickname: 'Dr. Nice', status: 'online', avatar: 'assets/images/avatar_default.png' },
// 	{ id: 13, nickname: 'Bombasto', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 14, nickname: 'Celeritas', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 15, nickname: 'Magneta', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 16, nickname: 'RubberMan', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 17, nickname: 'Dynama', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 18, nickname: 'Dr. IQ', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 19, nickname: 'Magma', status: 'online', avatar: 'assets/images/avatar_default.png'},
// 	{ id: 20, nickname: 'Tornado', status: 'online', avatar: 'assets/images/avatar_default.png'}
// ];

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
