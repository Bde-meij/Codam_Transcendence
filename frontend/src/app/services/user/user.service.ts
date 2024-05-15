import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from '../../models/user.class';
import { Observable, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user/current";
	// user$ : Observable<UserInterface>;
	constructor(private http: HttpClient, private router: Router) { };

	getUser() : Observable<UserInterface>{
		return this.http.get<UserInterface>(this.userUrl);
	};

	registerUser(newUser: UserInterface) {
		return this.http.post<any>("/api/auth/register", newUser);
	}
}
