import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from '../../models/user.class';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user";
	// user$ : Observable<UserInterface>;
	constructor(private http: HttpClient) { };

	getUser() : Observable<UserInterface>{
		return this.http.get<UserInterface>(this.userUrl, {});
	};

	registerUser(newUser: UserInterface) {
		return this.http.post(this.userUrl, newUser);
	}
}
