export class User {
	id: number;
	name: string;
	password: string;

	constructor(id: number, name: string, password: string) {
		this.id = id;
		this.name = name;
		this.password = password;
	}
}


export interface testUser {
	id: number;
	name: string;
	password: string;
}

