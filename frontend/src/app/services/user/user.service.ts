import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
	private matchUrl = "/api/match";

	constructor(private http: HttpClient, private router: Router) { };

	register(nickname : string) {
		return this.http.post(this.userUrl + '/register', { nickname });
	}

	changeName(nickname: string) {
		return this.http.post<any>(this.userUrl + '/changename', { nickname })
	}

	isNameTaken(nickname: string) : Observable<any> {
		return this.http.get<any>(this.userUrl + '/isnametaken', {params: {nickname: nickname}});
	}

	// to request your own info, use 'current', otherwise use the userID.
	getUser(id : string) : Observable<any> {
		if (id === 'current') {
			return this.http.get<any>(this.userUrl + '/current', {});
		}
		return this.http.get<any>(this.userUrl + '/name/' + id, {});
	};

	getUserIdByName(name: string) : Observable<any> {
		return this.http.get<any>(this.userUrl + '/getUserByName/' + name, {});
	}

	updateRoomKey(roomKey: number) {
		return this.http.post(this.userUrl + '/update-roomkey/' + roomKey.toString(), {});
	}

	uploadAvatar(file: File) : Observable<any> {
		const formData : FormData = new FormData();

		formData.append('file', file);
		return this.http.post<File>(this.userUrl + '/uploadAvatar', formData);
	}

	getAvatar(id: string) : Observable<Blob> {
		if (id === 'current')
			return this.http.get(this.userUrl + '/getAvatar/current', {responseType: 'blob'});
		// console.log("getavatar called");
		return this.http.get(this.userUrl + '/getAvatar/' + id, {responseType: 'blob'});
	}

	getMatches(id : string) {
		return this.http.get(this.matchUrl + '/user-matches/' + id, {});
	}

	getStats(id: string) {
		return this.http.get<any>(this.matchUrl + '/user-stats/' + id, {});
	}
}
