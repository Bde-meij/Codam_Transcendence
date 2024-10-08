import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
	private userUrl = "/api/user";
	private matchUrl = "/api/match";

	constructor(private http: HttpClient) { };

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

	getUserIdByName(nickname: string) : Observable<any> {
		return this.http.get<any>(this.userUrl + '/getUserByName/', {params: {nickname: nickname}});
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
		return this.http.get(this.userUrl + '/getAvatar/' + id, {responseType: 'blob'});
	}

	getMatches(id : string) {
		return this.http.get(this.matchUrl + '/user-matches/' + id, {});
	}

	getStats(id: string) {
		return this.http.get<any>(this.matchUrl + '/user-stats/' + id, {});
	}
}
