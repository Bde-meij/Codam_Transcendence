import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';

export class Account extends User {
	hobbies: string;

	constructor(id: number, username: string, email: string, hobbies: string) {
		super(id, username, email);
		this.hobbies = hobbies;
	}
}

@Injectable({
	providedIn: 'root'
})
export class AccountService {
	private id : number = 1;
	private username = "blabla";
	private email = "blabla@student.codam.nl"

	constructor() { }

	public isLoggedIn() : boolean {
		return true;
	}
	public getUser() : User {
		return (new User(this.id, this.username, this.email));
	}
	public clean() {
		this.id = 0;
		this.username = '';
		this.email = '';
	}
}
