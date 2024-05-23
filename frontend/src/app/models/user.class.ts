export interface UserInterface {
	id: string;
	nickname: string;
	status: string;
	avatar: FormData; //File?
}

export interface User {
	id: number;
	name: string;
}

export const FAKE_FRIENDS: User[] = [
	{ id: 12, name: 'Dr. Nice' },
	{ id: 13, name: 'Bombasto' },
	{ id: 14, name: 'Celeritas' },
	{ id: 15, name: 'Magneta' },
	{ id: 16, name: 'RubberMan' },
	{ id: 17, name: 'Dynama' },
	{ id: 18, name: 'Dr. IQ' },
	{ id: 19, name: 'Magma' },
	{ id: 20, name: 'Tornado' }
];

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
