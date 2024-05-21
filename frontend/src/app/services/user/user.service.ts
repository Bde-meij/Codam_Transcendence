import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from '../../models/user.class';
import { Observable, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user";
	// user$ : Observable<UserInterface>;
	constructor(private http: HttpClient, private router: Router) { };

	getUser() : Observable<UserInterface>{
		return this.http.get<UserInterface>(this.userUrl + '/current');
	};

	registerUser(newUser: UserInterface) {
		// TODO : link auth service properly
		return this.http.post<any>("/api/auth/register", newUser);
	}

	uploadAvatar(file: File) : Observable<any> {
		const formData : FormData = new FormData();

		formData.append('file', file);

		return this.http.post<File>(this.userUrl + '/uploadAvatar', formData);
	}

	getAvatar() : Observable<File> {
		return this.http.get<File>(this.userUrl + '/getAvatar');
	} 
}
