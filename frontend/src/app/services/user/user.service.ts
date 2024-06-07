import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { UserInterface } from '../../models/user.class';
import { Observable, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user";
	// user$ : Observable<UserInterface>;
	constructor(private http: HttpClient, private router: Router) { };

	getUser() : Observable<User>{
		console.log("getUser called");
		return this.http.get<User>(this.userUrl + '/current');
	};

	// registerUser(newUser: UserInterface) {
	// 	// TODO : link auth service properly
	// 	// return this.http.post<any>("/api/auth/register", newUser);
	// }

	uploadAvatar(file: File) : Observable<any> {
		const formData : FormData = new FormData();

		formData.append('file', file);

		return this.http.post<File>(this.userUrl + '/uploadAvatar', formData);
	}

	getAvatar() : Observable<Blob> {
		console.log("getavatar called");
		return this.http.get(this.userUrl + '/getAvatar', {responseType: 'blob'});
	} 
}
