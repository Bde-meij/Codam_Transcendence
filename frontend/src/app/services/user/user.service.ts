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

	constructor(private http: HttpClient, private router: Router) { };

	register(nickname : string) {
		return this.http.post(this.userUrl + '/register', { nickname });
	}

	changeName(nickname: string) {
		return this.http.post(this.userUrl + '/changename', { nickname })
	}

	isNameTaken (nickname: string) : Observable<boolean> {
		return this.http.get<boolean>(this.userUrl + '/isnametaken/' + nickname);
	}

	// to request your own info, use '0', otherwise use the userID.
	getUser(id : string) : Observable<User>{
		if (id == '0')
			return this.http.get<User>(this.userUrl + '/current');
		return this.http.get<User>(this.userUrl + '/name/' + id);
	};

	uploadAvatar(file: File) : Observable<any> {
		const formData : FormData = new FormData();

		formData.append('file', file);
		return this.http.post<File>(this.userUrl + '/uploadAvatar', formData);
	}

	getAvatar() : Observable<Blob> {
		console.log("getavatar called");
		return this.http.get(this.userUrl + '/getAvatar/', {responseType: 'blob'});
	}
}
